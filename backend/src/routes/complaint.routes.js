const router = require("express").Router();
const { Op } = require("sequelize");
const { Complaint, ComplaintHistory, User } = require("../models");
const { requireAuth, requireRole } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { attachOverdueFlag, isOverdue } = require("../utils/overdue");
const { statusChangeEmail } = require("../utils/email");

const HISTORY_INCLUDE = {
  model: ComplaintHistory,
  as: "history",
  include: [{ model: User, as: "actor", attributes: ["id", "name", "role"] }],
  // `separate: true` runs this as its own query per-parent so the ORDER BY
  // below actually applies (a single JOIN query doesn't reliably order
  // nested hasMany rows in Sequelize).
  separate: true,
  order: [["createdAt", "ASC"]],
};

// --- Resident: raise a complaint -------------------------------------------------
router.post(
  "/",
  requireAuth,
  requireRole("RESIDENT"),
  upload.single("photo"),
  async (req, res) => {
    try {
      const { category, description } = req.body;
      if (!category || !description) {
        return res.status(400).json({ error: "category and description are required" });
      }

      const complaint = await Complaint.create({
        category,
        description,
        residentId: req.user.id,
        photoUrl: req.file ? `/uploads/${req.file.filename}` : null,
        status: "OPEN",
      });

      // First history row marks the creation event itself.
      await ComplaintHistory.create({
        complaintId: complaint.id,
        status: "OPEN",
        note: "Complaint raised",
        actorId: req.user.id,
      });

      const full = await Complaint.findByPk(complaint.id, { include: [HISTORY_INCLUDE] });
      res.status(201).json({ complaint: attachOverdueFlag(full.toJSON()) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// --- Resident: list my complaints -------------------------------------------------
router.get("/mine", requireAuth, requireRole("RESIDENT"), async (req, res) => {
  try {
    const complaints = await Complaint.findAll({
      where: { residentId: req.user.id },
      include: [HISTORY_INCLUDE],
      order: [["createdAt", "DESC"]],
    });
    res.json({ complaints: complaints.map((c) => attachOverdueFlag(c.toJSON())) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Admin: list all complaints, with filters -------------------------------------
router.get("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const { status, category, from, to } = req.query;
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }

    const complaints = await Complaint.findAll({
      where,
      include: [
        HISTORY_INCLUDE,
        { model: User, as: "resident", attributes: ["id", "name", "email", "flatNumber"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    const withFlags = complaints.map((c) => attachOverdueFlag(c.toJSON()));
    // Overdue complaints surface at the top of the admin view, as required.
    withFlags.sort((a, b) => (b.isOverdue === a.isOverdue ? 0 : b.isOverdue ? 1 : -1));

    res.json({ complaints: withFlags });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Get one complaint (owner resident or any admin) -------------------------------
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id, {
      include: [
        HISTORY_INCLUDE,
        { model: User, as: "resident", attributes: ["id", "name", "email", "flatNumber"] },
      ],
    });
    if (!complaint) return res.status(404).json({ error: "Complaint not found" });
    if (req.user.role === "RESIDENT" && complaint.residentId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    res.json({ complaint: attachOverdueFlag(complaint.toJSON()) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Admin: update status (drives the lifecycle + history + email) -----------------
router.patch("/:id/status", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `status must be one of ${validStatuses.join(", ")}` });
    }

    const complaint = await Complaint.findByPk(req.params.id, {
      include: [{ model: User, as: "resident" }],
    });
    if (!complaint) return res.status(404).json({ error: "Complaint not found" });
    if (complaint.status === "RESOLVED") {
      return res.status(400).json({ error: "Complaint is already resolved and closed" });
    }

    complaint.status = status;
    if (status === "RESOLVED") complaint.resolvedAt = new Date();
    await complaint.save();

    await ComplaintHistory.create({
      complaintId: complaint.id,
      status,
      note: note || null,
      actorId: req.user.id,
    });

    // Fire-and-forget email; doesn't block the response if SMTP is slow/unset.
    statusChangeEmail({ resident: complaint.resident, complaint, status, note }).catch(() => {});

    const full = await Complaint.findByPk(complaint.id, { include: [HISTORY_INCLUDE] });
    res.json({ complaint: attachOverdueFlag(full.toJSON()) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Admin: set priority -----------------------------------------------------------
router.patch("/:id/priority", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const { priority } = req.body;
    if (!["LOW", "MEDIUM", "HIGH"].includes(priority)) {
      return res.status(400).json({ error: "priority must be LOW, MEDIUM or HIGH" });
    }
    const complaint = await Complaint.findByPk(req.params.id);
    if (!complaint) return res.status(404).json({ error: "Complaint not found" });

    complaint.priority = priority;
    await complaint.save();
    res.json({ complaint: attachOverdueFlag(complaint.toJSON()) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
