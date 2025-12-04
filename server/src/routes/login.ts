import express, { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import type { ExtendedPrismaClient } from "../../prisma/prismaClient.js";

export const loginHandler = (prismaClient: ExtendedPrismaClient) => async (req: Request, res: Response, next: NextFunction) => {
	try {
		if (req.session.user) return res.status(403).json({ errors: ["Already logged in."] });
		const { username, password } = req.body as { username?: string; password?: string };

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

		const user = await prismaClient.user.findUnique({
			where: { username: username },
		});
		
		if (user && bcrypt.compareSync(password, user.passwordHash)) {
			req.session.user = { uuid: user.uuid };
			res.cookie("user_id", req.session.user.uuid);
			res.cookie("session_id", req.sessionID);
			res.status(200).json(user.uuid);
		} else {
			res.status(401).json({ errors: ["Invalid username or password."] });
		}
	} catch (error) {
		console.error("Error logging in:\n");
		next(error);
	}
};

export default (prismaClient: ExtendedPrismaClient) => {
	const router = express.Router();
	router.post("/", loginHandler(prismaClient));
	return router;
};
