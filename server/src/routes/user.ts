import express, { Request, Response } from "express";
import { logError } from "../utils/logError.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import prisma from "../../prisma/prismaClient.js";

const router = express.Router({ mergeParams: true });

router.get("/:userId", async (req: Request, res: Response) => {
	try {
		const user = await prisma.user.findUniqueOrThrow({ omit: { id: true }, where: { uuid: req.params.userId } });
		res.send(user);
	} catch (error) {
		console.error("Error retrieving user from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

export default router;
