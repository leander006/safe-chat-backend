import express from 'express';
import { Server } from 'socket.io';
import { CLIENT_URL, JWT_KEY, PORT } from './config/serverConfig';
import googleAuthRoute from './routes/google-auth';
import userRoute from './routes/user-route';
import passport from 'passport';
import { passportAuth } from './config/jwt';
import session from "express-session";
import cors from 'cors'
const app = express();
const allusers: { [key: string]: { username: string; id: string }[] } = {};
let users: any[] = [];
const roomIdToSocket = new Map();
let onlineUsers: Set<string> = new Set();

app.use(
    cors({
      origin: [CLIENT_URL],
      credentials: true,
    })
  );

app.use(
    session({
      secret: JWT_KEY , 
      resave: false, // Avoid saving session if not modified
      saveUninitialized: false, // Avoid creating session until something is stored
      cookie: {
        secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
        httpOnly: true, // Prevent access via JavaScript
        sameSite: 'none', // Allow cross-origin cookies
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      },
    })
  );

app.use(passport.initialize());
app.use(passport.session());
passportAuth(passport);

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
// @ts-ignore
  cb(null, obj);
});

app.get('/', (req, res) => {
    res.send(`Hello World! ${process.env.NODE_ENV === 'production'}`);
});
  
const server = app.listen(PORT, () => {    
      console.log('Server is running on port '+PORT);
})

app.use("/api/auth/google",googleAuthRoute)
app.use("/api/user",userRoute)


const io = new Server(server, { 
    cors: { 
        origin: '*', 
        methods: ['GET', 'POST'] ,
        credentials: true, // Allow cookies to be sent with requests
    } 
});


io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('user-login',(user) =>{
        if(!user) {
            return
        }
        if (users.find(u => u.id === user.id)) {
            users = users.filter(u => u.id !== user.id);
        }
        const newUser = { ...user, socketId: socket.id };
        socket.data.user = newUser;
        users.push(newUser);
        socket.broadcast.emit("updateUserList", users);
    })

    socket.on('get-update',() =>{
        socket.emit("updateUserList", users);
    })

    socket.on('logout', (user) => {
        console.log("User logout event received:", user.username);
        if(!user) {
            return
        }
        users = users.filter(u => u.id !== user.id);
        onlineUsers.delete(socket.id);
        socket.broadcast.emit("updateUserList", users);
    })

    socket.on("audio-call",({from ,to, roomId}) => {    
        const newUser = { ...from, socketId: socket.id };
        console.log("New user for audio call: ");
        io.to(to.socketId).emit("incoming:audio", {from:newUser,roomId});
    });

    socket.on("video-call",({from ,to, roomId}) => {  
        const newUser = { ...from, socketId: socket.id };
        console.log("New user for video call: ");
        io.to(to.socketId).emit("incoming:video", {from:newUser,roomId});
    });


    socket.on('audio-call-accepted',({to,roomId}) =>{
        io.to(to.socketId).emit("outgoing-audio-call-accepted",{roomId});
    })
    socket.on('video-call-accepted',({to,roomId}) =>{
        io.to(to.socketId).emit("outgoing-video-call-accepted",{roomId});
    })

    socket.on('call-rejected',({to}) =>{
        io.to(to.socketId).emit("outgoing-call-rejected");
    })
    socket.on("check-room", ({roomId,username}) => {
        console.log("Checking availability for room: ",roomId," with username ",username," array size ",allusers[roomId]);
        if (!allusers[roomId]) {
            console.log("Room does not exist: ", roomId);
            return io.to(socket.id).emit('availability-response', { exist: false,roomId});
        }
        else if (allusers[roomId].length >= 2) {
            console.log("Room is full: ", roomId);
            return io.to(socket.id).emit('availability-response', { exist: false,roomId });
        }
        io.to(socket.id).emit('availability-response', { exist: true ,roomId});
    })
    socket.on('join-room', ({username,roomId}) => {
        if(!allusers[roomId]) {
            allusers[roomId] = [];
        }
        if(!allusers[roomId].find(user => user.username === username)) {
            allusers[roomId].push({username, id: socket.id });
            roomIdToSocket.set(socket.id, roomId);
        }
        console.log(`User ${username} joined room: ${roomId}, current users:`, allusers[roomId]);
        socket.join(roomId);
        for(const user of allusers[roomId]) {
            if(user.username !== username) {
                socket.to(user.id).emit('user-joined', {username, id:socket.id});
            }
        }
    });
    socket.on('user:offer', ({to, offer}) => {
        io.to(to).emit("incoming:offer", {from:socket.id, offer });
    })

    socket.on('user:answer', ({to, answer}) => {
        io.to(to).emit("incoming:answer", {from:socket.id, answer});
    })

    socket.on('ice-candidate', ({to, candidate}) => {
        if(candidate !== null) {
            io.to(to).emit("incoming:candidate", {from:socket.id, candidate});
        }
    })

    socket.on('user:leave', ({username,roomId}) => {
        if(!allusers[roomId]) {
            return;
        }
        const index = allusers[roomId].findIndex(user => user.username === username);
        const to = allusers[roomId].find(user => user.username !== username)?.id;
        console.log(`User ${username} left room: ${roomId} index: ${index}`);
       if (index !== -1) {
            allusers[roomId].splice(index, 1);
            socket.leave(roomId);
            roomIdToSocket.delete(socket.id);
            console.log(`User ${username} left room: ${roomId}, remaining users:`, allusers[roomId]);
            if (to) {
                socket.to(to).emit('user-left', { username, id: socket.id });
            }
        }
        delete allusers[roomId];
        roomIdToSocket.delete(socket.id);
        console.log(allusers[roomId] );
    })
    socket.on('disconnect', () => {
        const users = socket.data.user
        onlineUsers.delete(socket.id);
        if (!users) {
            return;
        }
        const roomId = roomIdToSocket.get(socket.id);
        if(!allusers[roomId]) {
            return
        }        
        const username=allusers[roomId].find(user => user.id === socket.id)?.username;
        console.log(`User ${username} left room: ${roomId}`);
        const to = allusers[roomId].find(user => user.username !== username)?.id;
        if (roomId && allusers[roomId]) {
            const index = allusers[roomId].findIndex(user => user.id === socket.id);
            if (index !== -1) {
                allusers[roomId].splice(index, 1);
                socket.leave(roomId);
                roomIdToSocket.delete(socket.id);
                if (to) {
                    socket.to(to).emit('user-left', { username, id: socket.id });
                }
            }
            delete allusers[roomId];
            console.log(allusers[roomId] );
        }
        roomIdToSocket.delete(socket.id);
    });

});