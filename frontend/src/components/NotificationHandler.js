import { useEffect, useCallback } from "react";
import socket from "../socket/socketClient";
import { toast } from "react-toastify";

const NotificationHandler = () => {
  useEffect(() => {
    const audio = new Audio("/notification_sound.mp3");

    // 🎵 Play sound + Toast
    const notify = (msg) => {
      if (!msg) return;
      toast.info(msg);
      audio.currentTime = 0;
      audio.play().catch(() => {});
    };

    // 🔥 Debug all socket events (remove later if not needed)
    socket.onAny((event, data) => {
      console.log("🔥 SOCKET EVENT RECEIVED:", event, data);
    });

    // -------------------------
    // ORDER CREATED
    // -------------------------
    const handleOrderCreated = (order) => {
      notify(`🆕 New order created: ${order?.orderId}`);
    };
    socket.on("order_created", handleOrderCreated);
    socket.on("order_created_global", handleOrderCreated);

    // -------------------------
    // ORDER UPDATED (items/payment changed)
    // -------------------------
    const handleOrderUpdated = (order) => {
      notify(`✏️ Order updated: ${order?.orderId}`);
    };
    socket.on("order_updated", handleOrderUpdated);

    // -------------------------
    // STATUS UPDATED
    // -------------------------
    const handleStatusUpdated = (order) => {
      notify(`📦 Order ${order?.orderId} status changed to ${order?.status}`);
    };
    socket.on("order_status_updated", handleStatusUpdated);
    socket.on("order_status_updated_global", handleStatusUpdated);

    // -------------------------
    // ITEM COLLECTED
    // -------------------------
    const handleItemCollected = (order) => {
      notify(`✔️ Item collected in order ${order?.orderId}`);
    };
    socket.on("order_collected", handleItemCollected);

    // -------------------------
    // ORDER DELETED
    // -------------------------
    const handleOrderDeleted = ({ orderId }) => {
      notify(`❌ Order ${orderId} was deleted`);
    };
    socket.on("order_deleted", handleOrderDeleted);

    // -------------------------
    // CLEANUP (VERY IMPORTANT)
    // -------------------------
    return () => {
      socket.off("order_created", handleOrderCreated);
      socket.off("order_created_global", handleOrderCreated);
      socket.off("order_updated", handleOrderUpdated);
      socket.off("order_status_updated", handleStatusUpdated);
      socket.off("order_status_updated_global", handleStatusUpdated);
      socket.off("order_collected", handleItemCollected);
      socket.off("order_deleted", handleOrderDeleted);
      socket.offAny();
    };
  }, []);

  return null;
};

export default NotificationHandler;
