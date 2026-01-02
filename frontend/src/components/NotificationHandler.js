import { useRef, useEffect, useContext } from "react";
import socket from "../socket/socketClient";
import { toast } from "react-toastify";
import { NotificationContext } from "../context/NotificationContext";

const NotificationHandler = () => {
  const { setNotifications } = useContext(NotificationContext);

  // 🚫 Prevent toast on login / refresh
  const isInitialLoadRef = useRef(true);

  // 🚫 Prevent duplicate toasts
  const lastToastRef = useRef(null);

  useEffect(() => {
    const audio = new Audio("/notification_sound.mp3");

    const user =
      JSON.parse(localStorage.getItem("agent")) ||
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(localStorage.getItem("auth")) ||
      {};

    const userId = user?._id || user?.id || user?.userId || "";
    const role = user?.role;

    /* ------------------------------
       PUSH HELPER
    ------------------------------ */
    const push = (msg, data, eventType) => {
      const orderId = data?.orderId || data?._id || "unknown";
      const uniqueKey = `${orderId}-${eventType}`;

      // ❌ Prevent duplicate toast
      if (lastToastRef.current === uniqueKey) return;
      lastToastRef.current = uniqueKey;

      // ✅ Always update context (bell count auto updates)
      setNotifications((prev) => [
        { message: msg, data, createdAt: new Date() },
        ...prev,
      ]);

      // ❌ No popup on login / refresh
      if (isInitialLoadRef.current) return;

      // ✅ Toast
      toast.info(msg, {
        position: "top-right",
        autoClose: 4000,
        pauseOnHover: true,
      });

      // ✅ Sound
      audio.currentTime = 0;
      audio.play().catch(() => {});
    };

    /* ------------------------------
       SOCKET EVENTS
    ------------------------------ */

    socket.on("order_created", (order) => {
      const dpId =
        typeof order.deliveryPersonId === "string"
          ? order.deliveryPersonId
          : order.deliveryPersonId?._id;

      const adminId =
        typeof order.assignedBy === "string"
          ? order.assignedBy
          : order.assignedBy?._id;

      if (role === "delivery-boy" && dpId === userId) {
        push(
          `🆕 New order assigned: ${order.orderId}`,
          order,
          "order_created"
        );
      }

      if (
        (role === "admin" || role === "superAdmin") &&
        adminId === userId
      ) {
        push(`🆕 Order ${order.orderId} created`, order, "order_created");
      }
    });

    // ❌ Order updated → bell only
    socket.on("order_updated", (order) => {
      setNotifications((prev) => [
        {
          message: `✏️ Order ${order.orderId} updated`,
          data: order,
          createdAt: new Date(),
        },
        ...prev,
      ]);
    });

    socket.on("order_status_updated", (order) => {
      const dpId =
        typeof order.deliveryPersonId === "string"
          ? order.deliveryPersonId
          : order.deliveryPersonId?._id;

      const adminId =
        typeof order.assignedBy === "string"
          ? order.assignedBy
          : order.assignedBy?._id;

      if (
        (role === "admin" || role === "superAdmin") &&
        adminId === userId
      ) {
        push(
          `📦 Order ${order.orderId} → ${order.status}`,
          order,
          "order_status_updated"
        );
      }

      if (role === "delivery-boy" && dpId === userId) {
        push(
          `📦 Your order ${order.orderId} → ${order.status}`,
          order,
          "order_status_updated"
        );
      }
    });

    socket.on("order_collected", (order) => {
      const adminId =
        typeof order.assignedBy === "string"
          ? order.assignedBy
          : order.assignedBy?._id;

      if (
        (role === "admin" || role === "superAdmin") &&
        adminId === userId
      ) {
        push(
          `✔️ Item collected in ${order.orderId}`,
          order,
          "order_collected"
        );
      }
    });

    socket.on("order_deleted", ({ orderId, assignedBy }) => {
      const adminId =
        typeof assignedBy === "string"
          ? assignedBy
          : assignedBy?._id;

      if (
        (role === "admin" || role === "superAdmin") &&
        adminId === userId
      ) {
        push(
          `❌ Order ${orderId} deleted`,
          { orderId },
          "order_deleted"
        );
      }
    });

    // ✅ Mark initial load complete
    isInitialLoadRef.current = false;

    return () => {
      socket.off("order_created");
      socket.off("order_updated");
      socket.off("order_status_updated");
      socket.off("order_collected");
      socket.off("order_deleted");
    };
  }, [setNotifications]);

  return null;
};

export default NotificationHandler;
