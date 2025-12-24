const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const Order = require("../models/orders.model");

async function fixPayments() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const orders = await Order.find({ status: "completed" });
    console.log(`📦 Found ${orders.length} orders to fix`);

    for (const order of orders) {
      // 🔑 STEP 1: Always recalc total from items
      const totalAmount = order.items.reduce((sum, item) => {
        const price = Number(item.price || 0);
        const qty = Number(item.quantity || 0);
        return sum + price * qty;
      }, 0);

      const paidAmount = Number(order.paymentDetails?.paidAmount || 0);

      let paymentStatus = "unpaid";
      let balanceAmount = totalAmount;

      if (paidAmount >= totalAmount && totalAmount > 0) {
        paymentStatus = "paid";
        balanceAmount = 0;
      } else if (paidAmount > 0 && paidAmount < totalAmount) {
        paymentStatus = "partial";
        balanceAmount = totalAmount - paidAmount;
      }

      order.paymentDetails = {
        totalAmount,
        paidAmount,
        balanceAmount,
        paymentStatus,
      };

      await order.save();

      console.log(
        `✔ Fixed ${order.orderId} → ${paymentStatus} | total: ₹${totalAmount}, paid: ₹${paidAmount}`
      );
    }

    console.log("🎉 ALL ORDERS FIXED CORRECTLY");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

fixPayments();
