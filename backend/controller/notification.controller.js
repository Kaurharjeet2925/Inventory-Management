const Notification = require("../models/notification.model");

exports.createNotification = async ({
  io,
  message,
  title = null,
  activityType,
  targetUser = null,
  targetRole = null,
  data = {},
}) => {
  try {
    const n = await Notification.create({
      message,
      title,
      activityType,
      targetUser,
      targetRole,
      data,
    });

    // 🔔 Safe socket emit
    if (io) {
      if (targetUser) {
        io.to(targetUser.toString()).emit("notification", n);
      }

      if (targetRole) {
        io.to(targetRole).emit("notification", n);
      }
    }

    return n;
  } catch (err) {
    console.error("createNotification error:", err);
    throw err;
  }
};

/* ================= GET NOTIFICATIONS ================= */
exports.getNotifications = async (req, res) => {
  try {
    const user = req.user;
    const unread = req.query.unread === "true";
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.max(Number(req.query.limit || 20), 1);

    const orClauses = [
      { targetUser: user._id },
      { targetRole: user.role },
    ];

    // Admin + SuperAdmin see admins room
    if (user.role === "admin" || user.role === "superAdmin") {
      orClauses.push({ targetRole: "admins" });
    }

    const filter = { $or: orClauses };
    if (unread) filter.read = false;

    const totalItems = await Notification.countDocuments(filter);

    const data = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      data,
    });
  } catch (err) {
    console.error("getNotifications error:", err);
    res.status(500).json({ message: "Failed to load notifications" });
  }
};

/* ================= MARK ONE READ ================= */
exports.markRead = async (req, res) => {
  try {
    const user = req.user;
    const notif = await Notification.findById(req.params.id);

    if (!notif) return res.status(404).json({ message: "Not found" });

    const allowed =
      (notif.targetUser && notif.targetUser.equals(user._id)) ||
      notif.targetRole === user.role ||
      (notif.targetRole === "admins" &&
        (user.role === "admin" || user.role === "superAdmin"));

    if (!allowed) return res.status(403).json({ message: "Not allowed" });

    notif.read = true;
    await notif.save();

    res.json({ message: "Marked as read" });
  } catch (err) {
    console.error("markRead error:", err);
    res.status(500).json({ message: "Failed to mark read" });
  }
};

/* ================= MARK ALL READ ================= */
exports.markAllRead = async (req, res) => {
  try {
    const user = req.user;

    const orClauses = [
      { targetUser: user._id },
      { targetRole: user.role },
    ];

    if (user.role === "admin" || user.role === "superAdmin") {
      orClauses.push({ targetRole: "admins" });
    }

    const result = await Notification.updateMany(
      { $or: orClauses, read: false },
      { $set: { read: true } }
    );

    res.json({
      message: "Marked all as read",
      updated: result.modifiedCount || 0,
    });
  } catch (err) {
    console.error("markAllRead error:", err);
    res.status(500).json({ message: "Failed to mark all read" });
  }
};
