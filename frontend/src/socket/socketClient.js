import { io } from "socket.io-client";
import { toast } from "react-toastify";

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

  // Handle auth-related errors explicitly
  const m = (err.message || '').toLowerCase();
  if (m.includes('no token') || m.includes('invalid token') || m.includes('unauthorized') || m.includes('jwt expired')) {
    // Clear token and user and notify
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.error('Socket authentication failed: please sign in again.');
    // Redirect to login (allow UI to react)
    try { window.location.href = '/login'; } catch(e){}
    return; // don't retry connect
  }

  // Non-auth errors → retry connection after delay
  setTimeout(() => {
    socket.connect();
  }, 1000);
});

// Auto-connect at startup if token exists
if (token) socket.connect();

// Notify app on successful connect so components can resync
socket.on('connect', () => {
  console.log('⚡ Socket connected (client):', socket.id);
  try {
    window.dispatchEvent(new CustomEvent('socket:connected', { detail: { socketId: socket.id } }));
  } catch (e) {
    // older browsers may not support CustomEvent constructor in same way
    const evt = document.createEvent('Event');
    evt.initEvent('socket:connected', true, true);
    window.dispatchEvent(evt);
  }
});

export default socket;
