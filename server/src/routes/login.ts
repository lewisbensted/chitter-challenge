import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { logError } from "../utils/logError.js";
import prisma from "../../prisma/prismaClient.js";
import { authenticate } from "../utils/authenticate.js";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
	const { username, password } = req.body as { username: string | undefined; password: string | undefined };
	try {
		if (authenticate(req)) {
			res.status(403).send(["Already logged in."]);
		} else if (!username || !password) {
			const errors: string[] = [];
			if (!username) {
				errors.push("Username not provided.");
			}
			if (!password) {
				errors.push("Password not provided.");
			}
			res.status(400).send(errors);
		} else {
			const user = await prisma.user.findUnique({
				where: { username: username },
			});
			if (user) {
				if (bcrypt.compareSync(password, user.password)) {
					req.session.user = { id: user.id, uuid: user.uuid };
					res.cookie("user_id", req.session.user.uuid);
					res.cookie("session_id", req.sessionID);
					res.status(200).send(user.uuid);
				} else {
					res.status(401).send(["Incorrect password."]);
				}
			} else {
				res.status(404).send(["User does not exist."]);
			}
		}
	} catch (error) {
		console.error("Error logging in:\n" + logError(error));
		res.status(500).send(["An unexpected error occured."]);
	}
});

export default router;
