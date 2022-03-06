const router = require('express').Router();
const Message = require('../model/Message')
const asyncHandler = require('express-async-handler')


router.post('/',asyncHandler(async(req,res)=>{
    const {sender, text} = req.body;
    const newmessage = new Message({
        conversationId:process.env.CONVERSATION_ID,
        sender,
        text,
    })
    try {
        const savedMessage = await newmessage.save();
        res.status(200).json(savedMessage)
    } catch (error) {
        res.status(500).json(error.message)
    }
}))

router.get('/',asyncHandler(async(req,res) =>{

    try {
        const conversations = await Message.find({})
        .populate("sender","-password")
        .populate("text");
        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json(error.message)
    }
}))
module.exports = router;