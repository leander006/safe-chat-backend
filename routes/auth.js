const router = require('express').Router();
const User = require('../model/User');
const bcrypt = require('bcrypt');
const generateToken = require('../config/authToken')
const asyncHandler = require('express-async-handler')
const { body, validationResult } = require('express-validator');




router.post('/register',[
    body('email','Enter valid email').isEmail(),
    body('username','Name must be atleast 5 characters').isLength({ min: 5 }),
    body('password','Password must be atleast 5 characters').isLength({ min: 5 }),
],asyncHandler(async(req,res) =>{

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {username, email,password} = req.body;

    const localPath = `public/images/profile/${req.file.filename}`;

	const uploadedImg = await cloudinaryUploadImage(localPath);

    

    if(!username|| !password || !email){
       return res.status(401).json("Enter all credentails")
    }

    const userExist = await User.findOne({username})
    const emailExist = await User.findOne({email})
    try {
        if(userExist)
        {
           return res.status(400).json("Username taken")
        }
        if(emailExist)
        {
           return res.status(404).json("Email exists")
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password,salt);

        const newuser = new User({
            username,
            email,
            password:hashPassword,
            // profilePic:uploadedImg.secure_url,
            // cloudinaryId:uploadedImg.public_id,
        })
        const user = await newuser.save();
        res.status(200).json({
            user,
            token: generateToken(user._id)
        })
    } catch (error) {
        res.status(500).json(error.meesage);
    }
}))


router.post('/login',[
    body('password','Name must be atleast 5 characters').isLength({ min: 5 }),
    body('username','Name must be atleast 5 characters').isLength({ min: 5 }),
],asyncHandler(async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {username,password} = req.body;
    console.log(username + password);
    if(!username|| !password)
        {
            return res.status(401).json("Enter correct credentails");
        }
    const users = await User.findOne({username});
    if(!users)
    {
        return res.status(404).json("User doesn't exist ");
    }
    const validate = await bcrypt.compare(password,users.password)
    if(!validate)
    {
        return res.sendStatus(401).json("Password not matched")
    }    
    try {
        const {password ,...others} = users._doc
        res.status(200).json({others , token : generateToken(users._id)});
        
    } catch (error) {
        res.status(500).json(error.message);
    }
        
}))

module.exports = router;