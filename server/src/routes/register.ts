import express, { Response } from "express";
import { logError } from "../utils/logError.js";
import prisma, { type ExtendedPrismaClient } from "../../prisma/prismaClient.js";
import { type RegisterUserRequest } from "../../types/requests.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import type { ExtendedUserClient } from "../../types/extendedClients.js";

const router = express.Router();

export const registerHandler =
	(prismaClient: ExtendedPrismaClient) => async (req: RegisterUserRequest, res: Response) => {
		try {
			const newUser = await (prismaClient.user as ExtendedUserClient).create({
				data: req.body,
			});
			res.status(201).json(newUser);
		} catch (error) {
			console.error("Error saving user to the database:\n" + logError(error));
			sendErrorResponse(error, res);
		}
	};

router.post("/", registerHandler(prisma));

export default router;
