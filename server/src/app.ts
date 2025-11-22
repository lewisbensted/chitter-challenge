import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import register from "./routes/register.js";
import login from "./routes/login.js";
import validate from "./routes/validate.js";
import cheets from "./routes/cheets.js";
import replies from "./routes/replies.js";
import logout from "./routes/logout.js";
import { logError } from "./utils/logError.js";
import prisma from "../prisma/prismaClient.js";
import messages from "./routes/messages.js";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

import path from "path";
import cors from "cors";
import conversations from "./routes/conversations.js";
import users from "./routes/users.js";
import { PrismaClientInitializationError } from "@prisma/client/runtime/library.js";
import { rateLimiter } from "./middleware/rateLimit.js";
import follow from "./routes/follow.js";
import MySQLStoreImport from "express-mysql-session";

dotenvExpand.expand(dotenv.config({ path: `../.env${process.env.NODE_ENV ? "." + process.env.NODE_ENV : ""}` }));

const __dirname = import.meta.dirname;

const MySQLStore = MySQLStoreImport(session);

const storeOptions = {
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	port: Number(process.env.DB_PORT),
	host: process.env.DB_HOST,
	expiration: 86400,
	schema: { tableName: "session_store" },
};

const sessionStore = new MySQLStore(storeOptions);

const checkValidPort = (port: number, side: string) => {
	if (Number.isNaN(port)) {
		throw new TypeError(`Invalid ${side} port provided - must be a number between 0 and 65536.`);
	} else if (port < 0 || port > 65535) {
		throw new RangeError(`Invalid ${side} port provided - must be a number between 0 and 65536.`);
	}
};

try {
	await prisma.$connect();

	const app = express();
	const FRONTEND_PORT = process.env.PORT ? Number(process.env.PORT) : 5173;
	const SERVER_PORT = Number(process.env.SERVER_PORT);
	checkValidPort(SERVER_PORT, "server");
	const PROJECT_ROOT = path.resolve(__dirname, "../../..");

	app.use(cookieParser());
	app.use(
		session({
			secret: "secret-key",
			name: "session",
			saveUninitialized: false,
			resave: false,
			store: sessionStore,
		})
	);

	if (process.env.NODE_ENV !== "prod") {
		checkValidPort(FRONTEND_PORT, "frontend");
		app.use(
			cors({
				origin: `http://localhost:${FRONTEND_PORT}`,
				credentials: true,
			})
		);
	}

	const authLimiter = rateLimiter(1000 * 60, 5);
	const generalLimiter = rateLimiter(1000 * 60 * 10, 1000);

	app.use("/api/users", generalLimiter, express.json(), users);
	app.use("/api/follow/:followingId", generalLimiter, express.json(), follow);
	app.use("/api/register", authLimiter, express.json(), register);
	app.use("/api/login", authLimiter, express.json(), login);
	app.use("/api/validate", generalLimiter, validate);
	app.use("/api/logout", generalLimiter, logout);
	app.use("/api/cheets", generalLimiter, express.json(), cheets);
	app.use("/api/conversations", generalLimiter, express.json(), conversations);
	app.use("/api/users/:userId/cheets", generalLimiter, express.json(), cheets);
	app.use("/api/cheets/:cheetId/replies", generalLimiter, express.json(), replies);
	app.use("/api/replies", generalLimiter, express.json(), replies);
	app.use("/api/messages", generalLimiter, express.json(), messages);
	app.all("/api/*", (_req, res) => {
		res.status(404).json({ errors: ["Route not found."], code: "ROUTE_NOT_FOUND" });
	});

	if (process.env.NODE_ENV === "prod") {
		const buildPath = path.join(PROJECT_ROOT, "frontend", "dist");
		app.use(express.static(buildPath));
		app.get("*", (_req, res) => {
			res.sendFile(path.join(buildPath, "index.html"));
		});
	}

	app.listen(SERVER_PORT, () => {
		console.log(`\nServer running on port ${SERVER_PORT}.\n`);
	}).on("error", (error) => {
		console.error(logError(error));
	});
} catch (error) {
	console.error(
		(error instanceof PrismaClientInitializationError ? "\nError initialising database connection:\n" : "") +
			logError(error)
	);
}
