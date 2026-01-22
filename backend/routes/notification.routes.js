const router = require("express").Router();
const auth = require("../middleware/auth");
const User = require("../models/user.model"); // ✅ REQUIRED
const {
  getNotifications,
  markRead,
  markAllRead,
} = require("../controller/notification.controller");
const paginate = require("../utils/pagination");
const ActivityLog = require("../models/activityLog.model");

// Mounted at /api/notifications
router.get("/", auth, getNotifications);
router.put("/:id/read", auth, markRead);
router.put("/mark-all-read", auth, markAllRead);

/* ================= ACTIVITY HISTORY ================= */
router.get("/activity", auth, async (req, res) => {
  try {
    const result = await paginate(
      ActivityLog,
      {}, // ✅ no filter (show all for now)
      req,
      { path: "performedBy", select: "name role" }, // ✅ populate works now
      { createdAt: -1 }
    );

    res.json(result);
  } catch (err) {
    console.error("Activity pagination error:", err);
    res.status(500).json({ message: "Failed to load activity log" });
  }
});

module.exports = router;
