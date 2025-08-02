// socket.js - Updated solution
import { io } from "socket.io-client";

let socket;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const SOCKET_URL =
  process.env.NODE_ENV === "production"
    ? "https://livepad-rwvk.onrender.com" // Your deployed server
    : "http://localhost:5000"; // Local dev

export const initSocket = () => {
  if (!socket || socket.disconnected) {
    socket = io(SOCKET_URL, {
      // Critical settings
      transports: ["websocket"],
      upgrade: false,
      forceNew: true,
      reconnection: false, // We'll handle manually

      // Timeout settings
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      reconnectAttempts = 0;
    });

    socket.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        setTimeout(() => {
          reconnectAttempts++;
          socket.connect();
        }, 1000 * reconnectAttempts);
      }
    });
  }
  return socket;
};
