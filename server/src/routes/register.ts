import express, { Response } from "express";
import { logError } from "../utils/logError.js";
import prisma from "../../prisma/prismaClient.js";
import { RegisterUserRequest, RegisterUserRequestBody } from "../../types/requests.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import { ExtendedUserClient } from "../../types/extendedClients.js";

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
