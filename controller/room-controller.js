const asyncHandler = require("express-async-handler");
const Room = require("../model/Room");

const createRoom = asyncHandler(async (req, res) => {
  const roomExist = await Room.findOne({ name: req.body.name });

  if (roomExist) {
    return res
      .status(401)
      .send({ message: "Room with this name already exits" });
  }
  try {
    const newRoom = new Room({
      name: req.body.name,
      owner: req.user._id,
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

module.exports = {
  createRoom,
  joinRoom,
};
