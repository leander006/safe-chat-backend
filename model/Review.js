const mongoose = require('mongoose');

const EnrollSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    number:{
        type:Number,
        required:true,
    },
    gender:{
        type:String,
        required:true,
    },
    membership:{
        type:String,
        require:true,
    },
    personalTrainning:{
        type:String,
        
    },
    experience:{
        type:String,
        require:true, 
    },
    query:{
        type:String,
    },

},
{timestamps:true}
)

module.exports = mongoose.model("Enroll",EnrollSchema)