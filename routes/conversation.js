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
router.put("/newConversation",asyncHandler(async(req,res) =>{
    const userID= process.env.CONVERSATION_ID

    const conversationId = await Conversation.findById(userID);
  
    const userFind= await Conversation.find({members:{$in:req.body.userId}})
    var member=conversationId.members;
    if(userFind.length===0)
    {
        try {
            const updatedconversation = await Conversation.findByIdAndUpdate(userID,{
                members:[...member,req.body.userId]
            },{new:true});
            res.status(200).json(updatedconversation)
        } catch (error) {
            res.status(500).json(error.message);
        }
        
     }
     else if(userFind.length>=0){
         return res.status(404).json("User already");
     }

   

}))

router.get('/:userId',asyncHandler(async(req,res) =>{
    try {
        const conversation = await Conversation.find({
            members: {$in:[req.params.userId]}
        })
        res.status(200).json(conversation);
    } catch (error) {
        res.status(500).json(error.message);
    }
}))

module.exports = router;