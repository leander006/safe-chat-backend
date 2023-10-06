const passport = require("passport");

const authenticate = (req, res, next) => {
  passport.authenticate("jwt", (error, user, data) => {
    if (error) next(error);
    if (!user) {
      return res.status(404).json({
        message: "Unauthorized access no token",
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};
module.exports = { authenticate };
