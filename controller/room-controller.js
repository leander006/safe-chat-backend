const asyncHandler = require("express-async-handler");
const Room = require("../model/Room");

const createRoom = asyncHandler(async (req, res) => {
  try {
    const newRoom = new Room({
      owner: req.user._id,
      members: [req.user._id, req.body.user],
    });

    const room = await newRoom.save();

    res.status(200).send({ message: room });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

const joinRoom = asyncHandler(async (req, res) => {
  const roomExist = await Room.findById(req.params.id);
  console.log(roomExist);
  try {
    if (!roomExist) {
      return res.status(402).send({ message: "Room does not exits" });
    }
    if (!roomExist.members.contains(req.user._id)) {
      await post.updateOne({ $push: { members: req.user._id } });
    } else {
      return res
        .status(401)
        .send({ message: "you have already joined the room" });
    }
    const newRoom = await Room.findById(req.params.id);
    res.status(200).json(newRoom);
  } catch (error) {
    res.status(501).send({ message: error.message });
    console.log(error);
  }
});

const getRoom = asyncHandler(async (req, res) => {
  try {
    const roomExist = await Room.find({
      members: { $elemMatch: { $eq: req.user._id } },
    }).populate("owner");
    if (!roomExist) {
      return res.status(402).send({ message: "Room does not exits" });
    }
    res.status(200).json(roomExist);
  } catch (error) {
    res.status(501).send({ message: error.message });
    console.log(error);
  }
});

const deleteRoom = asyncHandler(async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.status(200).json("Room deleted");
  } catch (error) {
    res.status(501).send({ message: error.message });
    console.log(error);
  }
});

module.exports = {
  createRoom,
  joinRoom,
  getRoom,
  deleteRoom,
};
