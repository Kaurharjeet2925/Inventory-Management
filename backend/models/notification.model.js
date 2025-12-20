const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  title: { type: String },
  data: { type: mongoose.Schema.Types.Mixed },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  targetRole: { type: String, default: null }, // e.g. 'admin', 'superAdmin', 'admins'
  read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);