const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    title: { type: String },

    message: {
      type: String,
      required: true,
    },

    activityType: {
      type: String,
      enum: [
        "order",
        "payment",
        "ledger",
        "client",
        "product",
        "system",
      ],
      required: true,
    },

    data: { type: mongoose.Schema.Types.Mixed },

    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    targetRole: {
      type: String, // admin, superAdmin, admins
      default: null,
    },

    read: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      expires: "30d",
    },
  },
  { timestamps: false }
);

module.exports = mongoose.model("Notification", NotificationSchema);
