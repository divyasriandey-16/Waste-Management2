const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const foodRoutes = require("./routes/food");
const chatRoutes = require("./routes/Chat");

// ⭐ IMPORTANT — IMPORT CHAT MODEL
const Chat = require("./models/Chat");

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api", authRoutes);
app.use("/api", foodRoutes);
app.use("/api", chatRoutes);

// ================= SOCKET.IO SETUP =================

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

// Make io accessible in routes
app.set("io", io);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // JOIN ROOM
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
  });

  // SEND MESSAGE
  socket.on("sendMessage", async (data) => {
    try {
      // ⭐ SAVE MESSAGE IN DB
      const newMsg = await Chat.create({
        roomId: data.roomId,
        sender: data.sender,
        message: data.message,
      });

      // ⭐ SEND ONLY TO THAT ROOM
      io.to(data.roomId).emit("receiveMessage", newMsg);

    } catch (err) {
      console.log("Chat save error:", err);
    }
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

    server.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((err) => console.log("MongoDB error:", err));

app.get("/", (req, res) => {
  res.send("Backend is working");
});