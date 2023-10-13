const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const express = require("express");
const googleAuth = require("../controller/google-controller");
const router = express.Router();
const {
  GOOGLE_CALLBACK_URL,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
  BASE_URL,
} = require("../config/serverConfig");

let userProfile;
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    function (accessToken, refreshToken, profile, done) {
      userProfile = profile;
      return done(null, userProfile);
    }
  )
);

// request at /auth/google, when user click sign-up with google button transferring
// the request to google server, to show emails screen
router.get(
  "/",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// URL Must be same as 'Authorized redirect URIs' field of OAuth client, i.e: /auth/google/callback
router.get(
  "/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/auth/google/error",
  }),
  (req, res) => {
    res.redirect("/api/auth/google/success"); // Successful authentication, redirect success.
  }
);
router.get("/success", async (req, res) => {
  const user = await googleAuth.registerWithGoogle(userProfile);
  const { password, ...others } = user._doc;
  const token = user.genJWT();
  res.redirect(`${BASE_URL}?token=${token}&data=${JSON.stringify(others)}`);
});

router.get("/error", (req, res) => res.send("Error logging in via Google.."));

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(BASE_URL);
});

module.exports = router;
