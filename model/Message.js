const mongoose = require("mongoose");
const User = require("../model/User");

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      trim: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
