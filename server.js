const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all for testing; use your Flutter app URL in production
    methods: ["GET", "POST"],
  },
});

// Store connected clients
let users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Save user type (e.g., doctor or user)
  socket.on("register", ({ role }) => {
    users[role] = socket.id;
    console.log(`${role} registered as ${socket.id}`);
  });

  // When user sends call request
  socket.on("call_request", (data) => {
    console.log("Incoming call request:", data);
    const doctorSocket = users["doctor"];
    if (doctorSocket) {
      io.to(doctorSocket).emit("incoming_call", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (const role in users) {
      if (users[role] === socket.id) {
        delete users[role];
      }
    }
  });
});

server.listen(3000, () => {
  console.log("Socket.IO server running on http://localhost:3000");
});
