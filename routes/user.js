const router = require('express').Router();
const User = require('../model/User')
const Conversation = require('../model/Conversation')
const asyncHandler = require('express-async-handler')


router.get('/',asyncHandler(async(req,res) =>{
   try {
      let user = await User.find();
      res.send(200).json(user);
   } catch (error) {
      res.status(500).json(error.message)
   }
}));

router.delete("/delete",asyncHandler(async(req,res) =>{
   // const {userId} = req.body;

   const userID=process.env.CONVERSATION_ID
   const conversationId = await Conversation.findById(req.user._id);
   var member=conversationId.members;
   var member= member.remove(req.user._id)
   
    const users = await User.findById(req.user._id);
    if(!users)
    {
       return res.status(404).json("Cannot find user");
    }
    try {
      await Conversation.findByIdAndUpdate(userID,{
         members:[...member]
      })
       await User.findByIdAndDelete(req.user._id);
        res.status(200).json("Deleted successfully");
    } catch (error) {
       res.status(500).json(error.message);
    }
}));

module.exports = router;