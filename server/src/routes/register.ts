import express, { Response } from "express";
import { logError } from "../utils/logError.ts";
import prisma from "../../prisma/prismaClient.ts";
import { RegisterUserRequest } from "../../types/requests.ts";
import { sendErrorResponse } from "../utils/sendErrorResponse.ts";
import { ExtendedUserClient } from "../../types/extendedClients.ts";

const router = express.Router();

const userClient = prisma.user as unknown as ExtendedUserClient;

router.post("/", async (req: RegisterUserRequest, res: Response) => {
	try {
		const newUser = await userClient.create({
			data: req.body,
		});
		res.status(201).json(newUser);
	} catch (error) {
		console.error("Error saving user to the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

export default router;
