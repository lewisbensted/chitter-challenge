import express, { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { UserSchema } from "../schemas/user.schema.js";
import { ZodError } from "zod";
import bcrypt from "bcrypt";
import { logError } from "../utils/logError.js";
import prisma from "../../prisma/prismaClient.js";

const router = express.Router();
export const registerExtension = Prisma.defineExtension({
	query: {
		user: {
			async create({ args, query }) {
				const parsedData = await UserSchema.parseAsync({
					...args.data,
					firstName: args.data.firstName?.trim(),
					lastName: args.data.lastName?.trim(),
				});
				parsedData.password = await bcrypt.hash(parsedData.password, 5);
				return query({ ...args, data: parsedData });
			},
		},
	},
});

router.post("/", async (req: Request, res: Response) => {
	try {
		const newUser = await prisma.$extends(registerExtension).user.create({
			data: (
				req as {
					body: { firstName: string; lastName: string; username: string; email: string; password: string };
				}
			).body,
			omit: { id: true, password: true },
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
