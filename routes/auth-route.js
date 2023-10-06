const router = require("express").Router();

const { registration, login } = require("../controller/auth-controller");

router.post("/register", registration);

router.post("/login", login);

module.exports = router;
