const router = require("express").Router();
const { Complaint } = require("../models");
const { requireAuth, requireRole } = require("../middleware/auth");
const { isOverdue } = require("../utils/overdue");

// Simple aggregate counts for the admin dashboard.
router.get("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const complaints = await Complaint.findAll();

    const byStatus = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0 };
    const byCategory = {};
    let overdueCount = 0;

    for (const c of complaints) {
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
      byCategory[c.category] = (byCategory[c.category] || 0) + 1;
      if (isOverdue(c)) overdueCount += 1;
    }

    res.json({
      totalComplaints: complaints.length,
      byStatus,
      byCategory,
      overdueCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
