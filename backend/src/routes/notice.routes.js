const router = require("express").Router();
const { Notice, User } = require("../models");
const { requireAuth, requireRole } = require("../middleware/auth");
const { noticeEmail } = require("../utils/email");

// Any authenticated user (resident or admin) can view the notice board.
// Important notices are pinned to the top, then newest first within each group.
router.get("/", requireAuth, async (req, res) => {
  try {
    const notices = await Notice.findAll({
      include: [{ model: User, as: "author", attributes: ["id", "name"] }],
      order: [
        ["important", "DESC"],
        ["createdAt", "DESC"],
      ],
    });
    res.json({ notices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin posts a notice; if marked important, every resident is emailed.
router.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const { title, body, important } = req.body;
    if (!title || !body) return res.status(400).json({ error: "title and body are required" });

    const notice = await Notice.create({
      title,
      body,
      important: !!important,
      authorId: req.user.id,
    });

    if (notice.important) {
      const residents = await User.findAll({ where: { role: "RESIDENT" } });
      // Fire-and-forget so a slow/unset SMTP server never blocks the API response.
      Promise.all(residents.map((resident) => noticeEmail({ resident, notice }))).catch(() => {});
    }

    res.status(201).json({ notice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
