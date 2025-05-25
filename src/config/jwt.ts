import prismaClient from "./prisma";
import { PassportStatic } from "passport";
import { JWT_KEY } from "./serverConfig";

const JWT = require("passport-jwt");


const JwtStrategy = JWT.Strategy;
const ExtractJwt = JWT.ExtractJwt;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_KEY,
};


export const passportAuth = async (passport: PassportStatic) => {
  passport.use(
    new JwtStrategy(opts, async (jwt_payload: { id: string }, done: (error: any, user?: any) => void) => {
      const user = await prismaClient.user.findUnique({
        where: {
          id: parseInt(jwt_payload.id, 10),
        },
      });
      // const user = await User.findById(jwt_payload.id);
      if (!user) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    })
  );
};

