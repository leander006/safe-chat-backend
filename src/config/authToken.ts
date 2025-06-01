import { JWT_KEY } from "./serverConfig";

const jwt = require('jsonwebtoken')


export const generateToken = (id: string | number) => {
    return jwt.sign({id},JWT_KEY,{expiresIn:"10d"})
}
