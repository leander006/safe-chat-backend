const router = require('express').Router();
const Message = require('../model/Message')
const asyncHandler = require('express-async-handler');
const Conversation = require('../model/Conversation');


router.post('/',asyncHandler(async(req,res)=>{
    const {text} = req.body;
    const userID= process.env.CONVERSATION_ID
    // console.log(userID);
    var member=[];
    const conversationId = await Conversation.findById(userID);
  
    const userFind= await Conversation.find({members:{$in:req.user._id}})
    // console.log(conversationId);
    member=conversationId.members;
   
    const newmessage = new Message({
        conversationId:process.env.CONVERSATION_ID,
        sender:req.user._id,
        text,
    })
    if(userFind.length===0)
    {
        try {
          await Conversation.findByIdAndUpdate(userID,{
                members:[...member,req.user._id]
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
        .populate("text");
        
        return res.status(200).json(conversations);
    } catch (error) {
        return res.status(500).json(error.message)
    }
}))
module.exports = router;