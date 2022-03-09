const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const Enroll = require('../model/Review')
const asyncHandler = require('express-async-handler')


router.post("/",[
    body('number','Number must only be 10 digit').isLength(10),
],asyncHandler(async(req,res) =>{

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {name,gender,experience,membership} = req.body;
    if(!name || !gender || !experience || !membership)
    {
        res.status(401).json("Enter all fields")
    }
    const enroll = new Enroll(req.body);
    try {
        const saveEnroll = await enroll.save();
        res.status(200).json(saveEnroll);
    } catch (error) {
        res.status(500).json(error.message)
    }
}))

module.exports = router;