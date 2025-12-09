import { io } from "socket.io-client";

let token = localStorage.getItem("token");

const socket = io("http://localhost:5000", {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  auth: { token }
});

// 🔥 When token changes (user role changes / login)
export const reconnectSocketWithToken = () => {
  token = localStorage.getItem("token");
  socket.auth = { token };
  socket.connect();
};

// 🔥 Auto reconnect on disconnect
socket.on("disconnect", (reason) => {
  console.log("⚠ Socket disconnected:", reason);

  if (reason === "io server disconnect") {
    // Manual disconnect by server → reconnect manually
    socket.connect();
  }
});

// 🔥 Handle connect errors
socket.on("connect_error", (err) => {
  console.log("❌ Socket connect error:", err.message);

  // Token expired / wrong token → refresh token
  if (err.message === "Unauthorized socket" || err.message === "No token") {
    token = localStorage.getItem("token");
    socket.auth = { token };
  }

  // Retry
  setTimeout(() => {
    socket.connect();
  }, 1000);
});

// Auto-connect at startup if token exists
if (token) socket.connect();

export default socket;
