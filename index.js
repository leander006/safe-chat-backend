const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const {protect} = require('./middleware/authMiddleware')
const videoRoute = require('./routes/video');
const authRoute = require('./routes/auth');
const userRoute = require('./routes/user');
const conversationRoute = require('./routes/conversation');
const messageRoute = require('./routes/message');
const enrollRoute = require('./routes/enrollment')
const app = express();
const cors = require('cors')


dotenv.config();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI).then(console.log("Connected to mongodb")).catch((err)=>{console.log(err)})

app.use("/api/auth",authRoute);
app.use("/api/user",protect,userRoute)
app.use("/api/conversation",protect,conversationRoute)
app.use("/api/message",messageRoute)
app.use("/api/enrollment",protect,enrollRoute)
app.use("/api/upload",protect,videoRoute)

app.get('/',(req,res)=>{
    res.send("hello from gym app");
  })


app.listen(process.env.PORT || 4000,()=>{
console.log("backend runnig on port 4000");
})