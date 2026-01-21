const Notification = require("../models/notification.model")

exports.logActivity = async ({
  io,
  title = null,
  message,
  activityType,
  targetUser = null,
  targetRole = null,
  data = {},
}) => {
  const notification = await Notification.create({
    title,
    message,
    activityType,
    targetUser,
    targetRole,
    data,
  });

  // Emit real-time
  if (targetUser) io.to(targetUser.toString()).emit("notification", notification);
  if (targetRole) io.to(targetRole).emit("notification", notification);

  return notification;
};
