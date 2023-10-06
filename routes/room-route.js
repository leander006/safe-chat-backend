const router = require("express").Router();

const { createRoom, joinRoom } = require("../controller/room-controller");
const { authenticate } = require("../config/authenticate");

router.post("/", authenticate, createRoom);

router.put("/:id", authenticate, joinRoom);

module.exports = router;
