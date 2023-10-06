const { token, allUser } = require("../controller/user-controller");

const { authenticate } = require("../config/authenticate");

const router = require("express").Router();

router.get("/", authenticate, allUser);
router.get("/:id/verify/:token", token);

module.exports = router;
