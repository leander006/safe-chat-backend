import express, { Request, Response } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import {googleAuthDal} from '../controllers/google-controller'
import { generateToken } from "../config/authToken";
import {
  GOOGLE_CALLBACK_URL,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
  BASE_URL,
} from "../config/serverConfig";
import prismaClient from "../config/prisma";

const router = express.Router();

interface UserProfile extends Profile {}

let userProfile: UserProfile | undefined;


passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID || (() => { throw new Error("GOOGLE_CLIENT_ID is not defined"); })(),
      clientSecret: GOOGLE_CLIENT_SECRET || (() => { throw new Error("GOOGLE_CLIENT_SECRET is not defined"); })(),
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    (accessToken: string, refreshToken: string, profile: UserProfile, done: Function) => {
      userProfile = profile;
      return done(null, userProfile);
    }
  )
);

// Redirects user to Google for authentication
router.get(
  "/",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Handles Google callback and redirects to success or failure
router.get(
  "/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/auth/google/error",
  }),
  (req: Request, res: Response) => {
    res.redirect("/api/auth/google/success");
  }
);


// @ts-ignore
router.get("/success", async (req: Request, res: Response) => {
  if (!userProfile) {
    return res.status(400).send("User profile not found.");
  }
  try {
    const transformedProfile = {
      id: userProfile.id,
      provider: userProfile.provider,
      displayName: userProfile.displayName,
      emails: userProfile.emails?.map(email => ({ value: email.value })) || [],
      _raw: userProfile._raw,
    };

    const user = await googleAuthDal.registerWithGoogle(transformedProfile); 
    if (!user) {
      return res.status(500).send("User information is not available.");
    }

    const token = generateToken(user.id); 
    res.cookie("authToken", token, {
      secure: true,      
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, 
    });
    res.cookie("user", JSON.stringify(user), {
      secure: true,       
      sameSite: "strict", 
      maxAge: 24 * 60 * 60 * 1000, 
    });
    res.redirect(`${BASE_URL}`);
  } catch (error) {
    console.log("Error processing user information:", error);
    res.status(500).send("Error processing user information.");
  }
});

router.get("/error", (req: Request, res: Response) => {
  res.send("Error logging in via Google.");
});


router.get("/logout", (req: Request, res: Response) => {

// @ts-ignore
  req.logout();
  if (!BASE_URL) {
    throw new Error("BASE_URL is not defined");
  }
  res.redirect(BASE_URL);
});

export default router;
