import express, { NextFunction, Response } from "express";
import { type ExtendedPrismaClient } from "../../prisma/prismaClient.js";
import { type RegisterUserRequest } from "../../types/requests.js";
import type { ExtendedUserClient } from "../../types/extendedClients.js";


export const registerHandler =
	(prismaClient: ExtendedPrismaClient) => async (req: RegisterUserRequest, res: Response, next: NextFunction) => {
		try {
			const newUser = await (prismaClient.user as unknown as ExtendedUserClient).create({
				data: req.body,
			});
			res.status(201).json(newUser);
		} catch (error) {
			console.error("Error saving user to the database:\n");
			next(error);
		}
	};

export default (prismaClient: ExtendedPrismaClient) => {
	const router = express.Router();
	
	router.post("/", registerHandler(prismaClient));

	return router;
};
