const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const rateLimit = require('express-rate-limit');

const app = express();

app.use(cors());
// 🔥 NEW: Required to parse incoming JSON payload from the frontend form
app.use(express.json()); 

const PORT = process.env.PORT || 4000; 

// ==========================================
// FORM SPAM PROTECTION & VALIDATION
// ==========================================

// Basic rate limiting: Max 3 submissions per 15 minutes per IP
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 3,
  message: { error: "Too many requests. Please try again later." }
});

app.post('/api/contact', formLimiter, (req, res) => {
  const { name, email, message, bot_field } = req.body;

  // 1. Honeypot check (Bot detected if this hidden field contains data)
  if (bot_field) return res.status(403).json({ error: "Spam detected." });

  // 2. Strict Server-Side Validation
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: "Invalid name." });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    return res.status(400).json({ error: "Message must be at least 10 characters." });
  }

  // TODO: Add your logic here to send an email (e.g., Nodemailer, SendGrid) or save to database
  console.log(`New contact submission from: ${name} (${email})`);

  res.status(200).json({ success: true });
});

// ==========================================
// SOCKET.IO WEBRTC SIGNALING
// ==========================================

const server = http.createServer(app);
const io = new Server(server, { // Updated to use the imported Server class properly
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  maxHttpBufferSize: 5e7,
  // 🔥 Super-fast heartbeats to detect internet drops instantly!
  pingTimeout: 10000,  // If no response in 10 seconds, kill the connection
  pingInterval: 5000   // Send a ping every 5 seconds
});

const activeCalls = {};

io.on("connection", (socket) => {
  socket.emit("me", socket.id);

  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("callUser", { signal: signalData, from, name });
  });

  socket.on("answerCall", (data) => {
    activeCalls[socket.id] = data.to;
    activeCalls[data.to] = socket.id;
    io.to(data.to).emit("callAccepted", data.signal);
  });

  socket.on("sendMessage", (messageData) => {
    socket.broadcast.emit("receiveMessage", messageData);
  });

  socket.on("endCall", ({ to }) => {
    delete activeCalls[socket.id];
    delete activeCalls[to];
    io.to(to).emit("callEnded");
  });

  socket.on("disconnect", () => {
    const partnerId = activeCalls[socket.id];
    if (partnerId) {
      io.to(partnerId).emit("callEnded");
      delete activeCalls[partnerId];
      delete activeCalls[socket.id];
    }
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});