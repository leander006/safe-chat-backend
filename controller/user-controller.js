const Token = require("../model/Token");
const User = require("../model/User");
const asyncHandler = require("express-async-handler");
const { cloudinary } = require("../utils/cloudinary");
const bcrypt = require("bcrypt");
const { SESSION } = require("../config/serverConfig");

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
    return res.status(500).send({ error: error });
  }
});

const uploadPic = async (req, res) => {
  try {
    const fileStr = req.body.data;
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      crop: "pad",
    });
    res.status(200).json(uploadResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Something went wrong" });
  }
};

const updateUser = asyncHandler(async (req, res) => {
  const { username, password, profile, bio } = req.body;
  const user = await User.findById(req.user._id);
  try {
    if (user.username == username) {
      return res.status(404).send({ message: "Username Exists" });
    }
    const hashedPassword = await bcrypt.hash(password, parseInt(SESSION));
    await cloudinary.uploader.destroy(user.profile.public_id);
    const newUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        bio: bio ? bio : user.bio,
        username: username ? username : user.username,
        profile: profile ? profile : user.profile,
        password: hashedPassword,
      },
      { new: true }
    );
    return res.status(200).json(newUser);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
});

const token = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    console.log(user);
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
  updateUser,
  uploadPic,
};
