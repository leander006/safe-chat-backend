import express, { Request, Response } from "express";
import {userDal} from "../controllers/user-controller";
import {authenticate} from "../config/authenticate";
const router = express.Router();

router.get("/me", async (req: Request, res: Response) => {
    const token = req.cookies;
    
    console.log("User details requested:", token);
    res.status(200).json({
        user:token,
    });
});

router.delete("/deleteUser", authenticate, async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const deletedUser = await userDal.deleteUser(req.user.id);
        res.status(200).json({
            message: "User deleted successfully",
            deletedUser,
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({
            error: error,
        });
    }
})

export default router;
