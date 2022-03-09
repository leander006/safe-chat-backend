const router = require('express').Router();
const Conversation = require('../model/Conversation')
const asyncHandler = require('express-async-handler')


router.post("/",asyncHandler(async(req,res) =>{
    
    const conversation = new Conversation({
        members:[req.body.userId]
    })
try {
    const savedConversation = await conversation.save();
    res.status(200).json(savedConversation)
} catch (error) {
    res.status(500).json(error.message);
}

}))


router.get('/',asyncHandler(async(req,res) =>{
    try {
        const conversation = await Conversation.find({})
        res.status(200).json(conversation);
    } catch (error) {
        res.status(500).json(error.message);
    }
}))

module.exports = router;