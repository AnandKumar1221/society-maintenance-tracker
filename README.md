# Society Maintenance Tracker

A full-stack platform for apartment societies to manage maintenance complaints end-to-end:
residents raise complaints with photos and track their progress, admins triage and resolve
them through a clear status workflow with priorities and overdue detection, and everyone
stays informed through a pinned notice board and email notifications.

**Stack:** Node.js + Express + Sequelize (SQLite) on the backend, React + Vite on the
frontend, JWT-based role auth (`RESIDENT`, `ADMIN`).

---

## 1. Project Structure

```
society-maintenance-tracker/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # Sequelize + SQLite connection
│   │   ├── models/                # User, Complaint, ComplaintHistory, Notice
│   │   ├── middleware/             # JWT auth, role guard, multer upload
│   │   ├── routes/                 # auth, complaints, notices, dashboard
│   │   ├── utils/                  # email sending, overdue calculation, admin seed script
│   │   └── index.js                # Express app entrypoint
│   ├── uploads/                    # complaint photos land here (gitignored)
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/client.js           # axios instance with JWT header injection
│   │   ├── context/AuthContext.jsx
│   │   ├── pages/                  # Login, Register, ResidentDashboard, AdminDashboard,
│   │   │                           #  ComplaintDetail, NoticeBoard
│   │   └── components/             # StatusBadge, PriorityBadge, ComplaintCard
│   ├── .env.example
│   └── package.json
├── SYSTEM_DESIGN.md
└── README.md
```

---

## 2. Prerequisites

- Node.js 18+ and npm
- No external database needed — SQLite is a local file, created automatically.

---

## 3. Local Setup

### 3.1 Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and adjust if needed (defaults work out of the box for local dev — see
[Section 6](#6-environment-variables) for what each variable does).

Create the initial admin account (reads `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`):

```bash
npm run seed
```

Start the API:

```bash
npm run dev       # with nodemon (auto-restart)
# or
npm start         # plain node
```

The API runs on `http://localhost:5000` by default. SQLite database file is created at
`backend/data/database.sqlite` on first run — no manual migration step needed.

### 3.2 Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app runs on `http://localhost:5173`. In dev mode, Vite proxies `/api` and `/uploads`
requests to `http://localhost:5000` (see `vite.config.js`), so `VITE_API_URL=/api` works
as-is with zero extra config.

### 3.3 Try it out

1. Go to `http://localhost:5173/register` and create a resident account.
2. Log in as admin with the credentials from your `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`,
   default `admin@society.com` / `Admin@123`).
3. As the resident: raise a complaint with a photo.
4. As the admin: open the complaint, set a priority, move it through
   Open → In Progress → Resolved, and check the history log building up.
5. Post a notice as admin (try "important") and view it on `/notices` as the resident.
6. Check `/` as admin for the dashboard counts.

---

## 4. Email Notifications

Emails are sent via SMTP (any free-tier provider works — Brevo, Mailtrap, Gmail App
Password, etc.). Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` in
`backend/.env`.

**If SMTP is left blank** (the default), the app does **not** fail — it simply logs what
would have been sent to the console, e.g.:

```
[email:skipped - no SMTP configured] to=resident@example.com subject="Complaint #4 status updated: RESOLVED"
```

This means the whole app is fully testable and gradable without setting up any email
account. To see real emails delivered, sign up for a free Brevo (Sendinblue) or Mailtrap
account and drop the SMTP credentials into `.env`.

---

## 5. Deploying (for the hosted URL deliverable)

Two free options that work well for this stack:

**Backend (Render or Railway):**
1. Push this repo to GitHub.
2. Create a new Web Service, point it at `backend/`.
3. Build command: `npm install`. Start command: `npm start`.
4. Add all variables from `backend/.env.example` in the dashboard's environment settings.
5. **Important:** SQLite files don't persist across redeploys on most free tiers unless
   you attach a persistent disk (Render offers a free persistent disk on some plans).
   For a class assignment this is usually fine — just re-run `npm run seed` after deploy
   if the disk resets.

**Frontend (Vercel or Render Static Site):**
1. Point it at `frontend/`.
2. Build command: `npm run build`. Output directory: `dist`.
3. Set `VITE_API_URL` to your deployed backend's full URL + `/api`, e.g.
   `https://your-backend.onrender.com/api`.
4. Update `FRONTEND_URL` in the backend's env to your deployed frontend URL (used for CORS).

---

## 6. Environment Variables

### `backend/.env`

| Variable | Purpose |
|---|---|
| `PORT` | Port the API listens on |
| `JWT_SECRET` | Secret used to sign auth tokens — set a long random string in production |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `DB_STORAGE` | Path to the SQLite file |
| `OVERDUE_DAYS` | Days a complaint can stay open before it's flagged overdue |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used only by `npm run seed` to create the first admin |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Email delivery — leave blank to log emails to console instead |
| `EMAIL_FROM` | From-address shown on outgoing emails |
| `FRONTEND_URL` | Used for CORS |

### `frontend/.env`

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the backend API. `/api` for local dev (proxied by Vite); full URL in production |

---

## 7. API Documentation

All endpoints are prefixed with `/api`. Authenticated endpoints require
`Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create a resident account. Body: `{ name, email, password, flatNumber }` |
| POST | `/auth/login` | Public | Body: `{ email, password }` → `{ token, user }` |
| GET | `/auth/me` | Any | Returns the logged-in user's profile |

> Admin accounts are **not** created through `/auth/register` (that endpoint always
> creates `RESIDENT` accounts). Admins are created via `npm run seed`, keeping the
> resident/admin boundary out of reach of the public signup form.

### Complaints

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/complaints` | Resident | Raise a complaint. `multipart/form-data`: `category`, `description`, optional `photo` file |
| GET | `/complaints/mine` | Resident | List my own complaints with full history |
| GET | `/complaints` | Admin | List all complaints. Query params: `status`, `category`, `from`, `to` (dates). Overdue complaints are sorted to the top |
| GET | `/complaints/:id` | Resident (own) / Admin | Single complaint with history |
| PATCH | `/complaints/:id/status` | Admin | Body: `{ status: "OPEN"\|"IN_PROGRESS"\|"RESOLVED", note? }`. Appends a history row, emails the resident, and locks the complaint once `RESOLVED` |
| PATCH | `/complaints/:id/priority` | Admin | Body: `{ priority: "LOW"\|"MEDIUM"\|"HIGH" }` |

Every complaint response includes a computed `isOverdue` boolean (see
[SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) for the logic).

### Notices

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/notices` | Any | List notices, important ones pinned to the top |
| POST | `/notices` | Admin | Body: `{ title, body, important? }`. If `important`, emails every resident |

### Dashboard

| Method | Endpoint | Role | Description |
|---|---|---|---|
| GET | `/dashboard` | Admin | `{ totalComplaints, byStatus, byCategory, overdueCount }` |

---

## 8. Database Schema

```
users
├── id            INTEGER PK
├── name           STRING
├── email          STRING UNIQUE
├── passwordHash   STRING
├── role           ENUM('RESIDENT','ADMIN')
├── flatNumber     STRING (nullable)
├── createdAt / updatedAt

complaints
├── id            INTEGER PK
├── residentId     FK -> users.id
├── category       STRING
├── description    TEXT
├── photoUrl       STRING (nullable, e.g. /uploads/172xxxx.jpg)
├── priority       ENUM('LOW','MEDIUM','HIGH')  default MEDIUM
├── status         ENUM('OPEN','IN_PROGRESS','RESOLVED')  default OPEN
├── resolvedAt     DATETIME (nullable)
├── createdAt / updatedAt

complaint_history          -- append-only audit trail, one row per status change
├── id            INTEGER PK
├── complaintId    FK -> complaints.id  (CASCADE on delete)
├── actorId        FK -> users.id       (who made the change)
├── status         ENUM('OPEN','IN_PROGRESS','RESOLVED')
├── note           TEXT (nullable)
├── createdAt                            -- no updatedAt: rows are immutable

notices
├── id            INTEGER PK
├── authorId       FK -> users.id
├── title          STRING
├── body           TEXT
├── important      BOOLEAN default false
├── createdAt / updatedAt
```

Relationships: `User 1—N Complaint` (as resident), `Complaint 1—N ComplaintHistory`,
`User 1—N ComplaintHistory` (as actor), `User 1—N Notice` (as author).

See [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) for the reasoning behind the history-table
design, overdue detection, photo handling, and notification flow.

---

## 9. Default Credentials (local/dev only — change before any real deployment)

- Admin: whatever you set in `.env` before running `npm run seed` (default
  `admin@society.com` / `Admin@123`)
- Residents: create your own via the Register page

---

## 10. Known Limitations / Possible Extensions

- SQLite is used for simplicity and zero-setup grading; swapping to Postgres is a one-line
  change in `config/db.js` (Sequelize dialect) since no raw SQL is used anywhere.
- No password-reset flow — out of scope for this assignment.
- File uploads are stored on local disk (`backend/uploads/`); for a production deployment
  with multiple server instances, this should move to S3 or similar object storage.
- Overdue threshold (`OVERDUE_DAYS`) is global; a real product might make it configurable
  per category (e.g. security issues overdue faster than cosmetic ones).
