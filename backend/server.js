const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const foodRoutes = require("./routes/food");
const chatRoutes = require("./routes/Chat");

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api", authRoutes);
app.use("/api", foodRoutes);
app.use("/api", chatRoutes);

// ================= SOCKET.IO SETUP =================

// Create HTTP server
const server = http.createServer(app);

// Create socket server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

// Make io accessible in routes
app.set("io", io);

// Socket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // JOIN CHAT ROOM
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
  });

  // SEND MESSAGE
  socket.on("sendMessage", (data) => {
    io.to(data.roomId).emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});


// ================= DATABASE =================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    // IMPORTANT: use server.listen instead of app.listen
    server.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((err) => console.log("MongoDB error:", err));

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend is working");
});
