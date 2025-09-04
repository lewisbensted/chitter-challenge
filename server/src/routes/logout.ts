import express, { Request, Response } from "express";
import { logError } from "../utils/logError.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";

const router = express.Router();

router.delete("/", (req: Request, res: Response) => {
	if (req.session.user) {
		req.session.destroy((error: unknown) => {
			if (error) {
				console.error("Error logging out:\n" + logError(error));
				sendErrorResponse(error, res);
			} else {
				Object.keys(req.cookies).forEach((key) => {
					res.clearCookie(key);
				});
				res.status(200).json("Logout successful.");
			}
		});
	} else {
		res.status(403).json({ errors: ["Not logged in."] });
	}
});

export default router;
