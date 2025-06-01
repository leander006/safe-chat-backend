const passport = require("passport");

import { Request, Response, NextFunction } from "express";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("jwt", (error: unknown, user: any, data: any) => {
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
