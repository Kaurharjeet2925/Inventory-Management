import { useEffect, useContext } from "react";
import socket from "../socket/socketClient";
import { toast } from "react-toastify";
import { NotificationContext } from "../context/NotificationContext";

const NotificationHandler = () => {
  const { setNotifications } = useContext(NotificationContext);

  useEffect(() => {
    const audio = new Audio("/notification_sound.mp3");

    const push = (msg, data) => {
      console.log("🔥 Notification Added:", msg, data);

      toast.info(msg);
      audio.currentTime = 0;
      audio.play().catch(() => {});

      // Store inside context for bell display
      setNotifications((prev) => [
        { message: msg, data, time: new Date().toLocaleTimeString() },
        ...prev,
      ]);
    };

    // EVENT HANDLERS
    socket.on("order_created", (order) => {
      console.log("📢 SOCKET RECEIVED: order_created", order);
      push(`🆕 New order created: ${order.orderId}`, order);
    });

    socket.on("order_updated", (order) => {
      console.log("📢 SOCKET RECEIVED: order_updated", order);
      push(`✏️ Order updated: ${order.orderId}`, order);
    });

    socket.on("order_status_updated", (order) => {
      console.log("📢 SOCKET RECEIVED: order_status_updated", order);
      push(`📦 Order ${order.orderId} is now ${order.status}`, order);
    });

    socket.on("order_collected", (order) => {
      console.log("📢 SOCKET RECEIVED: order_collected", order);
      push(`✔️ Item collected in order ${order.orderId}`, order);
    });

    socket.on("order_deleted", ({ orderId }) => {
      console.log("📢 SOCKET RECEIVED: order_deleted", orderId);
      push(`❌ Order ${orderId} deleted`, orderId);
    });

    return () => {
      socket.off("order_created");
      socket.off("order_updated");
      socket.off("order_status_updated");
      socket.off("order_collected");
      socket.off("order_deleted");
    };
  }, []);

  return null;
};

export default NotificationHandler;
