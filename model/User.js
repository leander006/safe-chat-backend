const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        require:true,
        unique:true,
    },
    password:{
        type:String,
        require:true,
    },
    admin:{
        type:String,
        default:false,
    },
},
{timestamps:true}
)

module.exports = mongoose.model("User",UserSchema)