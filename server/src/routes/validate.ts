import express, { Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { logError } from "../utils/logError.js";

const router = express.Router();

router.get("/", authMiddleware, (req: Request, res: Response) => {
	try {
		res.status(200).send(req.session.user!.uuid);
	} catch (error) {
		console.error("Error authenticating user:\n" + logError(error));
		res.status(500).send(["An unexpected error occured."]);
	}
});

export default router;
