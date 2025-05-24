import express, { json } from 'express';
import { Server } from 'socket.io';

const app = express();
const allusers: { [key: string]: { username: string; id: string }[] } = {};
const userIdToSocket = new Map();
app.get('/', (req, res) => {
    res.send('Hello World!');
  });
  
const server = app.listen(3001, () => {    
      console.log('Server is running on port 3001');
})
  
const io = new Server(server, { 
    cors: { 
        origin: '*', 
        methods: ['GET', 'POST'] 
    } 
});


io.on('connection', (socket) => {
    console.log('A user connected ',socket.id);
    socket.on('join-room', ({username,roomId}) => {
        if(!allusers[roomId]) {
            allusers[roomId] = [];
        }
        if(!allusers[roomId].find(user => user.username === username)) {
            allusers[roomId].push({username, id: socket.id });
            userIdToSocket.set(socket.id, roomId);
        }
        socket.join(roomId);
        for(const user of allusers[roomId]) {
            if(user.username !== username) {
                socket.to(user.id).emit('user-joined', {username, id:socket.id});
            }
        }
    });
    socket.on('user:offer', ({to, offer}) => {
        console.log(" user incoming call ");
        io.to(to).emit("incoming:offer", {from:socket.id, offer });
    })

    socket.on('user:answer', ({to, answer}) => {
        console.log(" user answering call  ");
        io.to(to).emit("incoming:answer", {from:socket.id, answer});
    })

    socket.on('ice-candidate', ({to, candidate}) => {
        if(candidate !== null) {
            io.to(to).emit("incoming:candidate", {from:socket.id, candidate});
        }
    })

    socket.on('user:leave', ({username,roomId}) => {
        const index = allusers[roomId].findIndex(user => user.username === username);
        const to = allusers[roomId].find(user => user.username !== username)?.id;
        console.log(`User ${username} left room: ${roomId}`,to);
        
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
    })
    socket.on('disconnect', () => {
        const roomId = userIdToSocket.get(socket.id);
        if(!allusers[roomId]) {
            return
        }
        const username=allusers[roomId].find(user => user.id === socket.id)?.username;
        const to = allusers[roomId].find(user => user.username !== username)?.id;
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