import express, { Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { logError } from "../utils/logError.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";

const router = express.Router();

router.get("/", authMiddleware, (req: Request, res: Response) => {
	try {
		res.status(200).json(req.session.user!.uuid);
	} catch (error) {
		console.error("Error authenticating user:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

export default router;
