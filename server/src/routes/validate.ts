import express, { Request, Response } from "express";
import { authenticator } from "../middleware/authentication.js";

const router = express.Router();

export const validateHandler = (req: Request, res: Response) => {
	const user = req.session.user;
	if (!user) return res.status(401).json({ errors: ["Unauthorised."] });
	return res.status(200).json(user.uuid);
};

router.get("/", authenticator, validateHandler);

export default router;
