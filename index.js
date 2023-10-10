const express = require("express");
const mongoose = require("mongoose");
const socket = require("socket.io");
const authRoute = require("./routes/auth-route");
const userRoute = require("./routes/user-route");
const conversationRoute = require("./routes/conversation");
const roomRoute = require("./routes/room-route");

const passport = require("passport");
const cors = require("cors");
const session = require("cookie-session");

const app = express();

const { MONGO_URI, PORT, JWT_KEY } = require("./config/serverConfig");
const { passportAuth } = require("./config/jwt");

app.use(cors());
app.use(express.json());

app.set("trust proxy", 1);
mongoose.set("strictQuery", false);
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log("Connected to mongodb"))
  .catch((err) => {
    console.log("invalid", err);
  });

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

app.use(
  session({
    secret: `${JWT_KEY}`,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());
passportAuth(passport);

passport.serializeUser(function (user, cb) {
  cb(null, user);
});
passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/conversation", conversationRoute);
app.use("/api/room", roomRoute);

app.get("/", (req, res) => {
  res.send("hello from video chatting app");
});
const server = app.listen(PORT, () => {
  console.log(`backend runnig on port ${PORT}`);
});
const users = new Map();
const io = socket(server, { cors: true });
io.on("connection", (socket) => {
  socket.on("join-socket", ({ userId }) => {
    users.set(userId, socket.id);
    console.log(`${userId} joined socket connection ${users.size}`);
  });
  socket.on("room:create", (data) => {
    console.log("room:create", data.user.username, "joined room ", data.roomId);
    socket.join(data.roomId);
    io.to(socket.id).emit("room:create", { data });
  });

  socket.on("room:join", (data) => {
    // console.log("room:join", data.user.username, "joined room ", data.roomId);
    io.to(data.roomId).emit("user:joined", {
      user: data.user,
      id: socket.id,
    });
    socket.join(data.roomId);
    io.to(socket.id).emit("room:join", { data });
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    // console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    // console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
  socket.on("send-notification", ({ userId, sender }) => {
    console.log("send-notification", userId?.username);
    const user = users.get(userId?._id);
    io.to(user).emit("got-notification", sender);
  });

  socket.on("leave-socket", function ({ userId }) {
    users.delete(userId);
    console.log("a user " + userId + " disconnected", users.size);
  });

  socket.on("send_message", (data) => {
    console.log("messageRecieved", data);
    const to = users.get(data.sender._id);
    io.to(to).emit("message recieved", data);
  });
});
