const mongoose = require('mongoose');
const { stringify } = require('nodemon/lib/utils');

const VideoSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true,
    },
    video:{
        type:String,
        required:true,
        unique:true
    },
},
{timestamps:true}
)

module.exports = mongoose.model("Video",VideoSchema)