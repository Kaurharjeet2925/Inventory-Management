const mongoose = require("mongoose");
const User = require("../models/user.model")
const activityLogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },

    activityType: {
      type: String,
      enum: [
        "order",
        "product",
        "client",
        "payment",
        "user",
        "system",
      ],
      required: true,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: true,
    },

    targetRole: {
      type: String, // admin / superAdmin / all
      default: "admin",
    },

    data: {
      type: Object, // orderId, amount, etc
      default: {},
    },
  },
  { timestamps: true }
);

// 🧹 AUTO DELETE AFTER 30 DAYS
activityLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 30 }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
