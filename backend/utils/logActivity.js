// utils/logActivity.js
const ActivityLog = require("../models/activityLog.model");

exports.logActivity = async ({
  title,
  message,
  activityType,
  performedBy,
  targetRole = "admin",
  data = {},
}) => {
  return await ActivityLog.create({
    title,
    message,
    activityType,
    performedBy,
    targetRole,
    data,
  });
};
