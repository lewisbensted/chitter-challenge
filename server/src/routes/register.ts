import express, { Response } from "express";
import { logError } from "../utils/logError.js";
import prisma from "../../prisma/prismaClient.js";
import { RegisterUserRequest } from "../../types/requests.js";
import { Prisma } from "@prisma/client";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";

const router = express.Router();

router.post("/", async (req: RegisterUserRequest, res: Response) => {
	try {
		const newUser = await prisma.user.create({
			data: req.body as unknown as Prisma.UserCreateInput,
		});
		res.status(201).json(newUser);
	} catch (error) {
		console.error("Error saving user to the database:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

export default router;
