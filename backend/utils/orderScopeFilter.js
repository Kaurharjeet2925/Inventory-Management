const mongoose = require("mongoose");

const getOrderScopeFilter = (user) => {
  if (!user || !user.role) {
    return { _id: null }; // fail-safe
  }

  // 🚚 Delivery boy → only his deliveries
  if (user.role === "delivery-boy") {
    return { deliveryPersonId: new mongoose.Types.ObjectId(user._id) };
  }

  // 🧑‍💼 Admin → only orders created by him
  if (user.role === "admin") {
    return { assignedBy: new mongoose.Types.ObjectId(user._id) };
  }

  // 👑 SuperAdmin → ALL orders
  return {};
};

module.exports = getOrderScopeFilter;
