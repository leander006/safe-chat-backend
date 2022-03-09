const router = require('express').Router();
const Message = require('../model/Message')
const asyncHandler = require('express-async-handler');
const Conversation = require('../model/Conversation');


router.post('/',asyncHandler(async(req,res)=>{
    const {sender, text} = req.body;
    const userID= process.env.CONVERSATION_ID
    var member=[];
    const conversationId = await Conversation.findById(userID);
  
    const userFind= await Conversation.find({members:{$in:sender}})
    member=conversationId.members;
   
    const newmessage = new Message({
        conversationId:process.env.CONVERSATION_ID,
        sender,
        text,
    })
    if(userFind.length===0)
    {
        try {
          await Conversation.findByIdAndUpdate(userID,{
                members:[...member,sender]
            },{new:true});
            const savedMessage = await newmessage.save();
        return res.status(200).json(savedMessage)
   
        } catch (error) {
            res.status(500).json(error.message);
        }
        
     }
     else if(userFind.length>=1)
     {
         try {
            const savedMessage = await newmessage.save();
            return res.status(200).json(savedMessage)
         } catch (error) {
             return res.status(404).json(error.message);
         }
   
     }
}))

router.get('/',asyncHandler(async(req,res) =>{

    try {
        const conversations = await Message.find({})
        .populate("sender","-password")
        .populate("text");
        
        return res.status(200).json(conversations);
    } catch (error) {
        return res.status(500).json(error.message)
    }
}))
module.exports = router;