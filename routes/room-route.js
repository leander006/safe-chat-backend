const router = require("express").Router();

const {
  createRoom,
  joinRoom,
  getRoom,
  deleteRoom,
} = require("../controller/room-controller");
const { authenticate } = require("../config/authenticate");

router.post("/", authenticate, createRoom);
router.get("/", authenticate, getRoom);
router.put("/:id", authenticate, joinRoom);
router.delete("/:id", authenticate, deleteRoom);

module.exports = router;
