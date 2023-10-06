const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    token: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);
const Token = mongoose.models.Token || mongoose.model("Token", tokenSchema);
module.exports = Token;
