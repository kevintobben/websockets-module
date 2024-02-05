const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const createAdapter = require("@socket.io/redis-adapter").createAdapter;
const redis = require("redis");
require("dotenv").config();
const { createClient } = redis;
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));

const botName = "Gespreksleider zegt:";



// Redis adapter
io.on("connection", (socket) => {
  console.log(io.of("/").adapter);
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welkomstbericht
    socket.emit("message", formatMessage(botName, `Welkom, ${user.username}!`));

    // Laat zien wanneer iemand de chat joint
    socket.broadcast
        .to(user.room)
        .emit(
            "message",
            formatMessage(botName, `${user.username} Is de chat gejoined`)
        );

    // Laat zien wie er in de chat zit
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // check voor chatMessage
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  // Run dit wanneer iemand disconnect
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      // Laat zien wie er nog in de chat zit
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });

      // Laat zien wanneer iemand de chat verlaat
      io.to(user.room).emit(
          "message",
          formatMessage(botName, `${user.username} Heeft de kamer verlaten`)
      );
    }
  });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
