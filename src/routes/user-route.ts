import express, { Request, Response } from "express";
import {userDal} from "../controllers/user-controller";
import {authenticate} from "../config/authenticate";
const router = express.Router();

router.get("/me", async (req: Request, res: Response) => {
    const rawHeaders = req.headers.cookie ? req.headers.cookie.split('; ') : [];
    let user = "";
    if (!rawHeaders.some(header => header.startsWith('user=')) || !rawHeaders.some(header => header.startsWith('authToken='))) {
        res.status(200).json({
            message: "No cookies found",
        });
        return;
    }    
    for (const header of rawHeaders) {
        const cookieParts = header.split('=');
        if (cookieParts[0] === 'user') {
            user = decodeURIComponent(cookieParts[1]);
            break;
        }
    }
    res.status(200).json({
        user:JSON.parse(user),
    });
});

router.get("/logout", async (req: Request, res: Response) => {
    try {

        res.clearCookie('authToken', {
            sameSite: 'none',
            secure: true,
        });
        res.clearCookie('user', {
            sameSite: 'none',
            secure: true,
        });
        res.status(200).send({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({
            error
        });
    }
})

export default router;
