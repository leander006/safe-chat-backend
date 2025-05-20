"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const allusers = {};
const userIdToSocket = new Map();
app.get('/', (req, res) => {
    res.send('Hello World!');
});
const server = app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
io.on('connection', (socket) => {
    console.log('A user connected ', socket.id);
    socket.on('join-room', ({ username, roomId }) => {
        console.log(`${username} joined room: ${roomId}`);
        if (!allusers[roomId]) {
            allusers[roomId] = [];
        }
        allusers[roomId].push({ username, id: socket.id });
        socket.join(roomId);
        console.log(allusers[roomId]);
        for (const user of allusers[roomId]) {
            console.log(`User ${user.username} and `, username, " and ", (user.username !== username));
            if (user.username !== username) {
                socket.to(user.id).emit('user-joined', { username, id: socket.id });
                console.log(`User ${username} joined the room.`, roomId);
                socket.emit('user-exist', { username: user.username, id: user.id });
                console.log(`User ${user.username} exist the room.`, roomId);
            }
        }
    });
    // socket.on('create-room', ({username,roomId}) => {
    //     console.log(`${username} created room: ${roomId}`);
    //     // Add the user to the room's user list
    //     if (!allusers[roomId]) {
    //         allusers[roomId] = {};
    //     }
    //     allusers[roomId][username] = {id: socket.id };
    //     console.log(allusers[roomId]);
    //     // Filter out the username from the room's user list
    //     io.emit("created", username);
    // });
    // socket.on('join-room', ({username,roomId}) => {
    //     console.log(`${username} joined room: ${roomId}`);
    //     if (!allusers[roomId]) {
    //         allusers[roomId] = {};
    //     }
    //     allusers[roomId][username] = {id: socket.id };
    //     console.log(allusers[roomId]);
    //     const filteredUsers = Object.keys(allusers[roomId])
    //     .filter(user => user !== username)
    //     .reduce((acc, user) => {
    //     acc[user] = allusers[roomId][user];
    //     return acc;
    //     }, {} as { [key: string]: { id: string } });
    // console.log('Filtered users:', filteredUsers);
    //     allusers[roomId]
    //     if(Object.keys(filteredUsers).length > 0){
    //         socket.emit('filtered-users', filteredUsers);
    //         for(const user in filteredUsers){
    //             io.to(filteredUsers[user].id).emit("joined", username);
    //             console.log(`User ${username} joined the room.`,filteredUsers[user].id);
    //         }        
    //     }
    // });
    // socket.on("offer", ({from, to, offer,roomId}) => {
    //     console.log({from , to ,roomId},"all users data ",allusers[roomId][to].id);
    //     io.to(allusers[roomId][to].id).emit("offer", {from, to, offer});
    // });
    // socket.on("answer", ({from, to, answer,roomId}) => {
    //     console.log({from , to ,roomId},"all users data ",allusers[roomId][from].id);
    //    io.to(allusers[roomId][from].id).emit("answer", {from, to, answer});
    // });
    // socket.on("end-call", ({from, to,roomId}) => {
    //     io.to(allusers[roomId][to].id).emit("end-call", {from, to});
    // });
    // socket.on("call-ended", caller => {
    //     const [from, to,roomId] = caller;
    //     io.to(allusers[roomId][from].id).emit("call-ended", caller);
    //     io.to(allusers[roomId][to].id).emit("call-ended", caller);
    // })
    // socket.on("icecandidate", candidate => {
    //     console.log({ candidate });
    //     //broadcast to other peers
    //     socket.broadcast.emit("icecandidate", candidate);
    // }); 
    socket.on('disconnect', () => {
        console.log('User disconnected ', socket.id);
    });
});
