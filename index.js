const express = require("express");
const mongoose = require("mongoose");
const socket = require("socket.io");
const authRoute = require("./routes/auth-route");
const userRoute = require("./routes/user-route");
const conversationRoute = require("./routes/conversation");
const roomRoute = require("./routes/room-route");
const googleRoute = require("./routes/google-auth");

const passport = require("passport");
const cors = require("cors");
const session = require("cookie-session");

const app = express();

const { MONGO_URI, PORT, JWT_KEY, URL } = require("./config/serverConfig");
const { passportAuth } = require("./config/jwt");

app.use(cors());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));

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
    origin: [URL, "http://localhost:3000"],
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
app.use("/api/auth/google", googleRoute);
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
const messages = new Map();
const io = socket(server, { cors: true });
io.on("connection", (socket) => {
  socket.on("join-socket", ({ userId }) => {
    users.set(userId, socket.id);
    console.log(`${userId} joined socket connection ${users.size}`);
  });

  socket.on("room:join", (data) => {
    console.log("room:join", data.user.username, "joined room ", data.roomId);
    io.to(data.roomId).emit("user:joined", {
      user: data.user,
      id: socket.id,
    });
    const arr = [];
    messages.set(data.roomId, arr);
    socket.join(data.roomId);
    io.to(socket.id).emit("room:join", { data });
  });

  socket.on("user:call", ({ to, offer }) => {
    console.log(to);
    socket.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
  socket.on("send-notification", ({ userId, sender }) => {
    const user = users.get(userId?._id);
    io.to(user).emit("got-notification", sender);
  });

  socket.on("leave-socket", function ({ userId }) {
    users.delete(userId);
    console.log("a user " + userId + " disconnected", users.size);
  });

  socket.on("send_message", (data) => {
    const message = messages.get(data.roomId);
    message.push(data);
    console.log("message", message);
    socket.to(data.roomId).emit("message_recieved", message);
  });

  socket.on("room_delete", (data) => {
    console.log("delete room");
    socket.to(data.roomId).emit("delete_room", data);
  });
});
