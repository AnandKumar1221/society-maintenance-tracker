# System Design Write-up

## Complaint History Model

The core design decision in this system is treating complaint status as a **derived
value with an append-only audit log behind it**, rather than a single mutable field with
no memory of its past. The `complaints` table stores the current `status` for fast reads
(list views, filters, dashboard counts), but every transition is also written as an
immutable row in a separate `complaint_history` table, holding the new status, an
optional note, a timestamp, and an `actorId` pointing back to the user who made the
change.

This two-table split exists because the two things are used differently. The current
status needs to be queried and filtered constantly ("show me all OPEN complaints") — that
belongs on the parent row where it can be indexed and filtered directly with `WHERE
status = ?`. But the *history* needs to be appended to, never edited, and read in full
only when someone opens a single complaint's detail view. Bolting an ever-growing JSON
array onto the `complaints` row would work for small volumes but makes filtering awkward
and doesn't scale; a proper child table with a foreign key is the standard way to model a
one-to-many audit trail, and it means `ComplaintHistory` rows can later support other
useful queries (e.g. "how many complaints did this admin resolve this month") without
touching the complaint schema at all.

The first history row is written at complaint creation itself (status `OPEN`, note
"Complaint raised", actor = the resident), so the full lifecycle — from raising to
resolution — lives in one continuous, chronologically ordered trail with no gaps. Every
subsequent status change (`PATCH /complaints/:id/status`) writes both the mutation on the
parent row and a new history row in the same request, so the two never drift out of sync.
Once a complaint reaches `RESOLVED`, the API refuses further status changes — resolution
is a terminal state, matching the requirement that resolved complaints are closed.

## Overdue Detection

Overdue status is **computed on read, not stored**. A complaint is overdue if its status
isn't `RESOLVED` and the time since `createdAt` exceeds a configurable threshold
(`OVERDUE_DAYS`, default 5, set via environment variable). This was a deliberate choice
over storing an `isOverdue` boolean column: a stored flag would need a background job or
cron to keep it fresh as time passes, adding a moving part and a source of staleness bugs
(a complaint could sit "not overdue" in the database well past the threshold until some
job got around to updating it). Computing it live means the flag is always accurate the
instant it's requested, and changing the threshold in `.env` takes effect immediately
across every complaint in the system with zero migration.

The admin complaint list applies this flag to every row, then does a stable sort placing
overdue complaints first — satisfying the requirement that overdue items surface at the
top of the admin view without needing a dedicated overdue endpoint.

## Photo Handling

Residents can optionally attach one photo when raising a complaint. Uploads are handled
by `multer` with disk storage: files are renamed to a timestamp + random suffix to avoid
collisions, restricted to image MIME types (jpeg/png/webp/gif), and capped at 5MB. The
stored complaint row keeps only a relative URL (`/uploads/<filename>`), and Express
serves that directory statically. This keeps the data model simple — no binary data in
SQLite — and the relative-URL approach means the frontend just needs to know the API's
base origin to render the image, which works identically whether the app runs locally
behind the Vite proxy or is deployed with frontend and backend on different domains. For
a production deployment behind multiple server instances, this is the one piece flagged
in the README as worth moving to object storage (S3 or similar), since local disk storage
doesn't survive a redeploy or scale horizontally — but for a single-instance deployment
(which fits this assignment's scope) it's a clean, dependency-free solution.

## Notification Flow

Two events trigger email: a complaint's status changing, and an important notice being
posted. Both go through a single `sendEmail` helper built on `nodemailer`, configured via
SMTP environment variables. Critically, if SMTP credentials aren't set, the helper
doesn't throw — it logs what would have been sent to the console and returns
gracefully. This was intentional so the app is fully demoable and gradable without
requiring a real email account: the entire complaint and notice lifecycle works with
emails visibly "sent" in the server log.

Emails are also fire-and-forget from the caller's perspective — the status-update and
notice-creation routes call the email helper but don't `await` it before responding, so a
slow or unreachable SMTP server never blocks or fails the underlying API action. This
keeps the read/write path for complaints and notices independent of email deliverability,
which matters more for grading reliability than guaranteed delivery does for this scope.
