import express, { Request, Response } from "express";
import { ZodError } from "zod";
import { logError } from "../utils/logError.js";
import prisma from "../../prisma/prismaClient.js";
import { RegisterUserRequestBody } from "../../types/requests.js";
import { Prisma } from "@prisma/client";

const router = express.Router();

router.post("/", async (req: Request<{}, {}, RegisterUserRequestBody>, res: Response) => {
	try {
		const newUser = await prisma.user.create({
			data: req.body as unknown as Prisma.UserCreateInput,
		});
		res.status(201).send(newUser);
	} catch (error) {
		console.error("Error saving user to the database:\n" + logError(error));
		if (error instanceof ZodError) {
			res.status(400).send(error.errors.map((err) => err.message));
		} else {
			res.status(500).send(["An unexpected error occured."]);
		}
	}
});

export default router;
