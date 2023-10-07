const Token = require("../model/Token");
const User = require("../model/User");
const asyncHandler = require("express-async-handler");

// const allUser = asyncHandler(async (req, res) => {
//   try {
//     const allUsers = await User.find({ _id: { $ne: req.user._id } });
//     return res.status(200).json(allUsers);
//   } catch (error) {
//     return res.status(500).send({ error: error.message });
//   }
// });
const allUser = asyncHandler(async (req, res) => {
  const name = req.query.name;
  try {
    const users = name
      ? await User.find({
          _id: { $ne: req.user._id },
          username: { $regex: name, $options: "i" },
        })
      : await User.find({ _id: { $ne: req.user._id } });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

const token = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      return res.status(400).send({ message: "Invalid link" });
    }
    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(401).send({ message: "Invalid link" });
    const newUser = await User.findByIdAndUpdate(user._id, {
      isVerified: true,
    });

    await Token.findByIdAndDelete(token._id);

    res.status(200).json(newUser);
  } catch (error) {
    return res.status(500).send({ message: "Internal server error" });
  }
};

module.exports = {
  token,
  allUser,
};
