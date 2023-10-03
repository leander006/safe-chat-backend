const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const {protect} = require('./middleware/authMiddleware')

const authRoute = require('./routes/auth');
const userRoute = require('./routes/user');
const conversationRoute = require('./routes/conversation');
const messageRoute = require('./routes/message');

const app = express();


const cors = require('cors')

const io = require('socket.io')(8900,{
  cors:{
    origin:"http://localhost:3000",
  }
});



dotenv.config();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI).then(console.log("Connected to mongodb")).catch((err)=>{console.log("invalid",err)})

app.use("/api/auth",authRoute);
app.use("/api/user",protect,userRoute)
app.use("/api/conversation",protect,conversationRoute)
app.use("/api/message",protect,messageRoute)

app.get('/',(req,res)=>{
    res.send("hello from gym app");
  })



  
let users =[];
const removeUser = (socketId) =>{
  users=users.filter((user) =>user.socketId !== socketId);
}
const addUser = (userId,socketId) =>{

  !users.some(user=>user.userId === userId) &&
  users.push({userId,socketId});
}
//---to get particular receiver for one on one chat--//
const getUser = (userId)=>{
  return users.find((user)=>user.userId === userId);
}
//----------------------------------------------------//

io.on("connection",(socket) =>{
  // console.log("a user connected");
  //----------add user to socket---//
 
  socket.on("addUser" ,userId=>{
    addUser(userId,socket.id);
  
    io.emit('getUser',users);
  })
  //------------send messsage ---------//

  socket.on("sendMessage",({senderId,text})=>{
  
    io.emit("getMessage",{
      senderId,
      text,
    })  
  })


//--------disconntect socket-----//
socket.on("disconnect",(socketId)=>{
  // console.log("user disconnected");
  removeUser(socketId)
  io.emit('getUser',users);
})

})




app.listen(process.env.PORT || 4000,()=>{
console.log("backend runnig on port 4000");
})