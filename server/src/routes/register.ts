import express, { Response } from "express";
import { logError } from "../utils/logError.js";
import prisma from "../../prisma/prismaClient.js";
import { RegisterUserRequest } from "../../types/requests.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import type { ExtendedUserClient } from "../../types/extendedClients.js";
import { PrismaClient } from "@prisma/client";

const router = express.Router();


export const registerHandler = (prismaClient: PrismaClient) => async (req: RegisterUserRequest, res: Response) => {
	try {
		const newUser = await prismaClient.user.create({
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
