import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { logError } from "../utils/logError.js";
import prisma from "../../prisma/prismaClient.js";
import { authenticate } from "../utils/authenticate.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import type { ExtendedUserClient } from "../../types/extendedClients.js";

const userClient = prisma.user as unknown as ExtendedUserClient;

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
	const { username, password } = req.body as { username: string | undefined; password: string | undefined };
	try {
		if (authenticate(req)) return res.status(403).json({ errors: ["Already logged in."] });

		if (!username || !password) {
			const errors: string[] = [];
			if (!username) {
				errors.push("Username not provided.");
			}
			if (!password) {
				errors.push("Password not provided.");
			}
			return res.status(400).json({ errors: errors });
		}

		const user = await userClient.findUnique({
			where: { username: username },
		});
		if (user) {
			if (bcrypt.compareSync(password, user.passwordHash)) {
				req.session.user = { uuid: user.uuid };
				res.cookie("user_id", req.session.user.uuid);
				res.cookie("session_id", req.sessionID);
				res.status(200).json(user.uuid);
			} else {
				res.status(401).json({ errors: ["Invalid username or password."] });
			}
		} else {
			res.status(401).json({ errors: ["Invalid username or password."] });
		}
	} catch (error) {
		console.error("Error logging in:\n" + logError(error));
		sendErrorResponse(error, res);
	}
});

export default router;
