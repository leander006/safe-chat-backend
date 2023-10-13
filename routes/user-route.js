const {
  token,
  allUser,
  uploadPic,
  updateUser,
} = require("../controller/user-controller");

const { authenticate } = require("../config/authenticate");

const router = require("express").Router();

router.get("/", authenticate, allUser);
router.get("/:id/verify/:token", token);
router.post("/upload", authenticate, uploadPic);
router.put("/update/:id", authenticate, updateUser);

module.exports = router;
