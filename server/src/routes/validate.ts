import express, { Request, Response } from "express";
import { authMiddleware } from "../middleware/authMiddleware.ts";
import { logError } from "../utils/logError.ts";
import { sendErrorResponse } from "../utils/sendErrorResponse.ts";

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
