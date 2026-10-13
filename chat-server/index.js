const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const rateLimit = require('express-rate-limit');

const app = express();

app.use(cors());
app.use(express.json()); 

const PORT = process.env.PORT || 4000; 

// ==========================================
// HEALTH CHECK ENDPOINTS
// ==========================================
app.get('/', (req, res) => {
  res.status(200).send('NetMeet WebRTC Signaling Server is active');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// ==========================================
// FORM SPAM PROTECTION & VALIDATION
// ==========================================
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 3,
  message: { error: "Too many requests. Please try again later." }
});

app.post('/api/contact', formLimiter, (req, res) => {
  const { name, email, message, bot_field } = req.body;

  if (bot_field) return res.status(403).json({ error: "Spam detected." });

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

  console.log(`New contact submission from: ${name} (${email})`);
  res.status(200).json({ success: true });
});

// ==========================================
// SOCKET.IO WEBRTC SIGNALING
// ==========================================
const server = http.createServer(app);
const io = new Server(server, { 
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  maxHttpBufferSize: 5e7,
  pingTimeout: 10000, 
  pingInterval: 5000 
});

const activeCalls = {};
const socketRooms = {}; // Tracks persistent room associations for reconnections

io.on("connection", (socket) => {
  socket.emit("me", socket.id);

  // Join persistent room based on Clerk User ID or socket fallback
  socket.on("joinRoom", ({ roomId }) => {
    if (roomId) {
      socket.join(roomId);
      socketRooms[socket.id] = roomId;
      console.log(`Socket ${socket.id} joined persistent room: ${roomId}`);
      
      socket.to(roomId).emit("peerJoined", { socketId: socket.id });
    }
  });

  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    socket.to(userToCall).emit("callUser", { signal: signalData, from, name });
  });

  socket.on("answerCall", (data) => {
    activeCalls[socket.id] = data.to;
    activeCalls[data.to] = socket.id;
    socket.to(data.to).emit("callAccepted", data.signal);
  });

  socket.on("sendMessage", (messageData) => {
    const roomId = socketRooms[socket.id];
    if (roomId) {
      socket.to(roomId).emit("receiveMessage", messageData);
    } else {
      socket.broadcast.emit("receiveMessage", messageData);
    }
  });

  socket.on("endCall", ({ to }) => {
    delete activeCalls[socket.id];
    delete activeCalls[to];
    if (to) {
      socket.to(to).emit("callEnded");
    }
  });

  socket.on("disconnect", () => {
    const partnerId = activeCalls[socket.id];
    if (partnerId) {
      socket.to(partnerId).emit("callEnded");
      delete activeCalls[partnerId];
      delete activeCalls[socket.id];
    }
    delete socketRooms[socket.id];
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});