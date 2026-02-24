import React, { useEffect, useState } from "react";
import axios from "axios";

function ChatBox({ socket, roomId, userRole }) {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");

  // Load old messages
  const loadMessages = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/chat/${roomId}`);
      setMessages(res.data);
    } catch (err) {
      console.log("Error loading chat:", err);
    }
  };

  useEffect(() => {
    if (!socket) return;

    // Join only this food room
    socket.emit("joinRoom", roomId);

    loadMessages();

    const handleReceive = (data) => {
      // Only update if same room
      if (data.roomId === roomId) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.on("receiveMessage", handleReceive);

    return () => {
      socket.off("receiveMessage", handleReceive);
    };
  }, [socket, roomId]);

  const sendMessage = () => {
    if (!msg.trim()) return;

    const messageData = {
      roomId,
      sender: userRole,
      message: msg,
    };

    socket.emit("sendMessage", messageData);

    setMsg("");
  };

  return (
    <div className="card mt-2 p-2">
      <h6>💬 Live Chat</h6>

      <div
        style={{
          height: "120px",
          overflowY: "auto",
          border: "1px solid #ddd",
          padding: "6px",
        }}
      >
        {messages.map((m, i) => (
          <div key={i}>
            <b>{m.sender}: </b> {m.message}
          </div>
        ))}
      </div>

      <input
        className="form-control mt-2"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Type message..."
      />

      <button className="btn btn-primary mt-2" onClick={sendMessage}>
        Send
      </button>
    </div>
  );
}

export default ChatBox;
