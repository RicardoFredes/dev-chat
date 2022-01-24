const express = require("express");
const app = express();
const path = require("path");
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log("Server listening at port %d", port);
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (_req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/:groupId", (_req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

let numUsers = 0;

io.on("connection", (socket) => {
  let addedUser = false;

  socket.emit("login");

  socket.on("disconnect", () => {
    if (addedUser) {
      numUsers--;
      socket.broadcast.to(socket.groupId).emit("chat disconnect", {
        username: socket.username,
        numUsers,
      });
    }
    socket.emit("login");
  });

  socket.on("chat message", (message) => {
    socket.broadcast.to(socket.groupId).emit("chat message", {
      username: socket.username,
      message,
      numUsers,
    });
  });

  socket.on("chat join request", ({ username, groupId }) => {
    if (addedUser) return;
    addedUser = true;
    numUsers++;
    socket.username = username;
    socket.groupId = groupId;
    socket.join(groupId);
    socket.emit("chat join response", { username, numUsers });
    socket.broadcast.to(groupId).emit("chat connect", { username, numUsers });
  });
});

module.exports = server;
