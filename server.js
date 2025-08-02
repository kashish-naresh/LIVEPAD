const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);

// Enable CORS for frontend
// server.js
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket"], // Force WebSocket only
  pingTimeout: 60000, // Increase timeout
  pingInterval: 25000,
  cookie: false,
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Serve static files from build directory
app.use(express.static("build"));
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Store room states (roomID -> currentCode)
const roomStates = new Map();

// Get all connected clients in a room
function getAllConnectedClients(roomID) {
  const room = io.sockets.adapter.rooms.get(roomID);
  if (!room) return [];
  return Array.from(room).map((socketID) => ({
    socketID,
  }));
}

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Handle joining a room
  socket.on("join", ({ roomID }) => {
    try {
      socket.join(roomID);

      // Initialize room state if it doesn't exist
      if (!roomStates.has(roomID)) {
        roomStates.set(roomID, "");
      }

      const clients = getAllConnectedClients(roomID);

      // Notify all clients in the room about new connection
      clients.forEach(({ socketID }) => {
        io.to(socketID).emit("joined", {
          clients,
          socketID: socket.id,
        });
      });

      // Send current room state to the new client
      socket.emit("code_change", {
        code: roomStates.get(roomID),
      });
    } catch (error) {
      console.error("Error in join handler:", error);
    }
  });

  // Handle code changes from clients
  socket.on("code_change", ({ roomID, code }) => {
    try {
      if (!roomID || !code) return;

      // Update the room state
      roomStates.set(roomID, code);

      // Broadcast to all other clients in the room
      socket.to(roomID).emit("code_change", { code });
    } catch (error) {
      console.error("Error in code_change handler:", error);
    }
  });

  // Handle code synchronization requests
  socket.on("sync_code", ({ socketID, code }) => {
    try {
      if (!socketID) return;
      io.to(socketID).emit("code_change", { code });
    } catch (error) {
      console.error("Error in sync_code handler:", error);
    }
  });

  // Handle disconnection
  socket.on("disconnecting", () => {
    try {
      const rooms = [...socket.rooms];
      rooms.forEach((roomID) => {
        socket.in(roomID).emit("disconnected", {
          socketID: socket.id,
        });
      });
    } catch (error) {
      console.error("Error in disconnecting handler:", error);
    }
  });

  // Handle general errors
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  socket.on("ping", (timestamp) => {
    console.log("Received ping:", timestamp);
    socket.emit("pong", timestamp);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

// Clean up room states periodically (optional)
setInterval(() => {
  const now = Date.now();
  // You could implement room cleanup logic here if needed
}, 60 * 60 * 1000); // Check every hour
