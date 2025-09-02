import express, { Request, Response } from "express";
import { logError } from "../utils/logError.ts";
import { sendErrorResponse } from "../utils/sendErrorResponse.ts";
import prisma from "../../prisma/prismaClient.ts";
import { ExtendedUserClient } from "../../types/extendedClients.ts";

const router = express.Router({ mergeParams: true });

const userClient = prisma.user as unknown as ExtendedUserClient;

router.get("/:userId", async (req: Request, res: Response) => {
	try {
		const user = await userClient.findUniqueOrThrow({ where: { uuid: req.params.userId } });
		res.json(user);
	} catch (error) {
		console.error("Error retrieving user from the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

export default router;
