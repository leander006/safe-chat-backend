"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const serverConfig_1 = require("./config/serverConfig");
const google_auth_1 = __importDefault(require("./routes/google-auth"));
const passport_1 = __importDefault(require("passport"));
const jwt_1 = require("./config/jwt");
const express_session_1 = __importDefault(require("express-session"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const allusers = {};
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
}));
app.use((0, express_session_1.default)({
    secret: serverConfig_1.JWT_KEY || 'default_secret_key', // Replace with a secure secret
    resave: false, // Avoid saving session if not modified
    saveUninitialized: false, // Avoid creating session until something is stored
    cookie: {
        secure: process.env.NODE_ENV === "production", // Use HTTPS in production
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
(0, jwt_1.passportAuth)(passport_1.default);
passport_1.default.serializeUser(function (user, cb) {
    cb(null, user);
});
passport_1.default.deserializeUser(function (obj, cb) {
    // @ts-ignore
    cb(null, obj);
});
const userIdToSocket = new Map();
app.get('/', (req, res) => {
    res.send('Hello World!');
});
const server = app.listen(serverConfig_1.PORT, () => {
    console.log('Server is running on port 3001');
});
app.use("/api/auth/google", google_auth_1.default);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
io.on('connection', (socket) => {
    console.log('A user connected ', socket.id);
    socket.on('join-room', ({ username, roomId }) => {
        if (!allusers[roomId]) {
            allusers[roomId] = [];
        }
        if (allusers[roomId].length >= 2) {
            return socket.emit('room-full', { message: 'Room is full' });
        }
        if (!allusers[roomId].find(user => user.username === username)) {
            allusers[roomId].push({ username, id: socket.id });
            userIdToSocket.set(socket.id, roomId);
        }
        socket.join(roomId);
        for (const user of allusers[roomId]) {
            if (user.username !== username) {
                socket.to(user.id).emit('user-joined', { username, id: socket.id });
            }
        }
    });
    socket.on('user:offer', ({ to, offer }) => {
        console.log(" user incoming call ");
        io.to(to).emit("incoming:offer", { from: socket.id, offer });
    });
    socket.on('user:answer', ({ to, answer }) => {
        console.log(" user answering call  ");
        io.to(to).emit("incoming:answer", { from: socket.id, answer });
    });
    socket.on('ice-candidate', ({ to, candidate }) => {
        if (candidate !== null) {
            io.to(to).emit("incoming:candidate", { from: socket.id, candidate });
        }
    });
    socket.on('user:leave', ({ username, roomId }) => {
        var _a;
        const index = allusers[roomId].findIndex(user => user.username === username);
        const to = (_a = allusers[roomId].find(user => user.username !== username)) === null || _a === void 0 ? void 0 : _a.id;
        console.log(`User ${username} left room: ${roomId}`, to);
        if (index !== -1) {
            allusers[roomId].splice(index, 1);
            socket.leave(roomId);
            userIdToSocket.delete(socket.id);
            if (to) {
                socket.to(to).emit('user-left', { username, id: socket.id });
            }
        }
        if (allusers[roomId].length === 0) {
            delete allusers[roomId];
        }
    });
    socket.on('disconnect', () => {
        var _a, _b;
        const roomId = userIdToSocket.get(socket.id);
        if (!allusers[roomId]) {
            return;
        }
        const username = (_a = allusers[roomId].find(user => user.id === socket.id)) === null || _a === void 0 ? void 0 : _a.username;
        const to = (_b = allusers[roomId].find(user => user.username !== username)) === null || _b === void 0 ? void 0 : _b.id;
        if (roomId && allusers[roomId]) {
            const index = allusers[roomId].findIndex(user => user.id === socket.id);
            if (index !== -1) {
                allusers[roomId].splice(index, 1);
                socket.leave(roomId);
                userIdToSocket.delete(socket.id);
                if (to) {
                    socket.to(to).emit('user-left', { username, id: socket.id });
                }
            }
            if (allusers[roomId].length === 0) {
                delete allusers[roomId];
            }
        }
        userIdToSocket.delete(socket.id);
    });
});
