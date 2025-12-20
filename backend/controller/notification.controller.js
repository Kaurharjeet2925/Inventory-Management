const Notification = require('../models/notification.model');

// Create + emit helper
exports.createNotification = async ({ io, message, title = null, targetUser = null, targetRole = null, data = {} }) => {
  try {
    const n = await Notification.create({ message, title, targetUser, targetRole, data });

    // Emit to specific user
    if (targetUser) {
      io.to(targetUser.toString()).emit('notification', n);
    }

    // Emit to role/room (admins)
    if (targetRole) {
      // For 'admins' we send to that room
      io.to(targetRole).emit('notification', n);
    }

    return n;
  } catch (err) {
    console.error('createNotification error:', err);
    throw err;
  }
};

// GET /notifications?unread=true&page=1&limit=20
exports.getNotifications = async (req, res) => {
  try {
    const user = req.user;
    const unread = req.query.unread === 'true';
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);

    const orClauses = [
      { targetUser: user._id },
      { targetRole: user.role }
    ];

    if (user.role === 'admin' || user.role === 'superAdmin') {
      orClauses.push({ targetRole: 'admins' });
    }

    const filter = { $or: orClauses };
    if (unread) filter.read = false;

    const total = await Notification.countDocuments(filter);
    const data = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({ page, limit, totalItems: total, totalPages: Math.ceil(total / limit), data });
  } catch (err) {
    console.error('getNotifications error:', err);
    res.status(500).json({ message: 'Failed to load notifications' });
  }
};

// PUT /notifications/:id/read
exports.markRead = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.user;

    const notif = await Notification.findById(id);
    if (!notif) return res.status(404).json({ message: 'Notification not found' });

    // Ensure user has access
    const ok = (notif.targetUser && notif.targetUser.equals(user._id)) || notif.targetRole === user.role || (notif.targetRole === 'admins' && (user.role === 'admin' || user.role === 'superAdmin'));
    if (!ok) return res.status(403).json({ message: 'Not allowed' });

    notif.read = true;
    await notif.save();
    res.json({ message: 'Marked read' });
  } catch (err) {
    console.error('markRead error:', err);
    res.status(500).json({ message: 'Failed to mark read' });
  }
};

// PUT /notifications/mark-all-read
exports.markAllRead = async (req, res) => {
  try {
    const user = req.user;

    const orClauses = [
      { targetUser: user._id },
      { targetRole: user.role }
    ];

    if (user.role === 'admin' || user.role === 'superAdmin') {
      orClauses.push({ targetRole: 'admins' });
    }

    const filter = { $or: orClauses, read: false };

    const result = await Notification.updateMany(filter, { $set: { read: true } });
    res.json({ message: 'Marked all as read', updated: result.modifiedCount || result.nModified || 0 });
  } catch (err) {
    console.error('markAllRead error:', err);
    res.status(500).json({ message: 'Failed to mark all read' });
  }
};