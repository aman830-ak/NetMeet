// server/index.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

// Dynamic port assignment for Render cloud hosting
const PORT = process.env.PORT || 4000; 

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  maxHttpBufferSize: 5e7 // Allows up to 50MB file sharing!
});

io.on("connection", (socket) => {
  // 1. Give the user their ID
  socket.emit("me", socket.id);

  // 2. WEBRTC SIGNALING: Handle Calling
  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("callUser", { signal: signalData, from, name });
  });

  // 3. WEBRTC SIGNALING: Handle Answering
  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });

  // 4. Handle Chat Messages and File Sharing
  socket.on("sendMessage", (messageData) => {
    socket.broadcast.emit("receiveMessage", messageData);
  });

  // 5. FIX: Handle explicit call termination (Moved INSIDE the connection block)
  socket.on("endCall", ({ to }) => {
    io.to(to).emit("callEnded");
  });

  // 6. FIX: Handle Disconnect safely
  socket.on("disconnect", () => {
    // We removed the aggressive broadcast here. 
    // Now it just quietly logs the disconnection without destroying other people's calls!
    console.log("Client disconnected:", socket.id);
  });
});

// Start the server on the correct cloud port
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});