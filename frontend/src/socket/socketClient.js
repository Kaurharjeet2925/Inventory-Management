import { io } from "socket.io-client";
import { toast } from "react-toastify";

const getToken = () => {
  try {
    return (
      localStorage.getItem("token") ||
      JSON.parse(localStorage.getItem("auth") || "{}")?.token ||
      JSON.parse(localStorage.getItem("user") || "{}")?.token ||
      JSON.parse(localStorage.getItem("agent") || "{}")?.token ||
      null
    );
  } catch {
    return null;
  }
};

let token = getToken();

const socket = io("http://localhost:5000", {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  auth: { token },
});

// 🔁 Reconnect after login / refresh
export const reconnectSocketWithToken = () => {
  token = getToken();
  if (!token) return;

  socket.auth = { token };

  if (!socket.connected) {
    socket.connect();
  }
};

// 🔌 Disconnect
socket.on("disconnect", (reason) => {
  console.log("⚠ Socket disconnected:", reason);
  if (reason === "io server disconnect") socket.connect();
});

// ❌ Auth errors
socket.on("connect_error", (err) => {
  console.log("❌ Socket error:", err.message);

  if (
    err.message.toLowerCase().includes("token") ||
    err.message.toLowerCase().includes("unauthorized")
  ) {
    localStorage.clear();
    toast.error("Session expired. Please login again.");
    window.location.href = "/";
    return;
  }

  setTimeout(() => socket.connect(), 1000);
});

// ✅ Auto connect
if (token) socket.connect();

socket.on("connect", () => {
  console.log("⚡ Socket connected (client):", socket.id);
});

export default socket;
