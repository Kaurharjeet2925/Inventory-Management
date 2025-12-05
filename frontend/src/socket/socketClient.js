import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: (cb) => {
    cb({ token: localStorage.getItem("token") });
  },
  transports: ["websocket"],
  reconnection: true,
});

export default socket;
