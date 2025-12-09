import { useEffect, useContext } from "react";
import socket from "../socket/socketClient";
import { toast } from "react-toastify";
import { NotificationContext } from "../context/NotificationContext";

const NotificationHandler = () => {
  const { setNotifications } = useContext(NotificationContext);

  useEffect(() => {
    const audio = new Audio("/notification_sound.mp3");
    const user = JSON.parse(localStorage.getItem("agent") || localStorage.getItem("user") || localStorage.getItem("auth") || "{}");
    const userId = user?._id || user?.id || user?.userId || "";

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
      
      // Handle both cases: deliveryPersonId as string or as object
      const deliveryPersonId = typeof order.deliveryPersonId === "string" 
        ? order.deliveryPersonId 
        : order.deliveryPersonId?._id;
      
      // Send notification to assigned delivery person only
      if (user?.role === "delivery-boy" && deliveryPersonId === userId) {
        push(`🆕 New order assigned to you: ${order.orderId}`, order);
      }
    });

    socket.on("order_updated", (order) => {
      console.log("📢 SOCKET RECEIVED: order_updated", order);
      
      // Handle both cases for IDs
      const deliveryPersonId = typeof order.deliveryPersonId === "string" 
        ? order.deliveryPersonId 
        : order.deliveryPersonId?._id;
      
      const assignedById = typeof order.assignedBy === "string"
        ? order.assignedBy
        : order.assignedBy?._id;
      
      // Send to delivery person if it's their order, or to admin who assigned it
      const isDeliveryPerson = user?.role === "delivery-boy" && deliveryPersonId === userId;
      const isAssigningAdmin = (user?.role === "admin" || user?.role === "superAdmin") && assignedById === userId;
      
      if (isDeliveryPerson || isAssigningAdmin) {
        push(`✏️ Order ${order.orderId} has been updated`, order);
      }
    });

    socket.on("order_status_updated", (order) => {
      console.log("📢 SOCKET RECEIVED: order_status_updated", order);
      
      // Handle both cases for IDs
      const deliveryPersonId = typeof order.deliveryPersonId === "string" 
        ? order.deliveryPersonId 
        : order.deliveryPersonId?._id;
      
      const assignedById = typeof order.assignedBy === "string"
        ? order.assignedBy
        : order.assignedBy?._id;
      
      const deliveryPersonName = typeof order.deliveryPersonId === "string"
        ? "Delivery Person"
        : order.deliveryPersonId?.name || "Delivery Person";
      
      // Send to admin who assigned the order when delivery person updates status
      if ((user?.role === "admin" || user?.role === "superAdmin") && assignedById === userId) {
        push(`📦 Order ${order.orderId} status changed to ${order.status} by ${deliveryPersonName}`, order);
      }
      // Also notify delivery person of their own status changes
      else if (user?.role === "delivery-boy" && deliveryPersonId === userId) {
        push(`📦 Your order ${order.orderId} is now ${order.status}`, order);
      }
    });

    socket.on("order_collected", (order) => {
      console.log("📢 SOCKET RECEIVED: order_collected", order);
      
      // Handle both cases
      const assignedById = typeof order.assignedBy === "string"
        ? order.assignedBy
        : order.assignedBy?._id;
      
      // Notify admin who assigned the order
      if ((user?.role === "admin" || user?.role === "superAdmin") && assignedById === userId) {
        push(`✔️ Item collected in order ${order.orderId}`, order);
      }
    });

    socket.on("order_deleted", ({ orderId, assignedBy }) => {
      console.log("📢 SOCKET RECEIVED: order_deleted", orderId);
      
      // Handle both cases
      const assignedById = typeof assignedBy === "string"
        ? assignedBy
        : assignedBy?._id;
      
      // Notify admin who assigned the order
      if ((user?.role === "admin" || user?.role === "superAdmin") && assignedById === userId) {
        push(`❌ Order ${orderId} has been deleted`, orderId);
      }
    });

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
