import express from "express";
import session, * as expressSession from "express-session";
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
import MySQLStore from "express-mysql-session";
import path from "path";
import cors from "cors";
import conversations from "./routes/conversations.js";
import user from "./routes/user.js";
import { PrismaClientInitializationError } from "@prisma/client/runtime/library";

dotenvExpand.expand(dotenv.config({ path: `../.env${process.env.NODE_ENV ? "." + process.env.NODE_ENV : ""}` }));
const SessionStore = MySQLStore(expressSession);
const __dirname = import.meta.dirname;

const sessionStoreOptions: MySQLStore.Options = {
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	port: Number(process.env.DB_PORT),
	host: process.env.DB_HOST,
	expiration: 86400,
	schema: { tableName: "session_store" },
};

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
	const FRONTEND_PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
	const SERVER_PORT = Number(process.env.SERVER_PORT);
	checkValidPort(Number(SERVER_PORT), "server");
	const PROJECT_ROOT = path.resolve(__dirname, "../../..");

	if (process.env.NODE_ENV === "production") {
		const buildPath = path.join(PROJECT_ROOT, "frontend", "build");
		app.use(express.static(buildPath));
		app.get("*", (_req, res) => {
			res.sendFile(path.join(buildPath, "index.html"));
		});
	} else {
		checkValidPort(Number(FRONTEND_PORT), "frontend");
		app.use(
			cors({
				origin: `http://localhost:${FRONTEND_PORT}`,
				credentials: true,
			})
		);
	}

	app.use(cookieParser());
	app.use(
		session({
			secret: "secret-key",
			name: "session",
			saveUninitialized: false,
			resave: false,
			store: new SessionStore(sessionStoreOptions),
		})
	);

	app.use("/user", express.json(), user);
	app.use("/register", express.json(), register);
	app.use("/login", express.json(), login);
	app.use("/validate", validate);
	app.use("/logout", logout);
	app.use("/cheets", express.json(), cheets);
	app.use("/conversations", express.json(), conversations);
	app.use("/users/:userId/cheets", express.json(), cheets);
	app.use("/cheets/:cheetId/replies", express.json(), replies);
	app.use("/messages", express.json(), messages);
	app.all("*", (_req, res) => {
		res.status(404).json({ errors: ["Route not found."], code: "ROUTE_NOT_FOUND" });
	});
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
