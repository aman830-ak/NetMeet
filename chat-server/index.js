const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 4000; 

const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  maxHttpBufferSize: 5e7,
  // 🔥 FIX: Super-fast heartbeats to detect internet drops instantly!
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