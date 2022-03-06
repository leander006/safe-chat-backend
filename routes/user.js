const router = require('express').Router();
const User = require('../model/User')
const Conversation = require('../model/Conversation')
const asyncHandler = require('express-async-handler')



router.delete("/delete",asyncHandler(async(req,res) =>{
   const {userId} = req.body;

   const userID=process.env.CONVERSATION_ID
   const conversationId = await Conversation.findById(userID);
   var member=conversationId.members;
   var member= member.remove(userId)
   
    const users = await User.findById(req.body.userId);
    if(!users)
    {
       return res.status(404).json("Cannot find user");
    }
    try {
      await Conversation.findByIdAndUpdate(userID,{
         members:[...member]
      })
       await User.findByIdAndDelete(userId);
        res.status(200).json("Deleted successfully");
    } catch (error) {
       res.status(500).json(error.message);
    }
}));

module.exports = router;