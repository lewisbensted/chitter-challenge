import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import register from "./routes/register.js";
import login from "./routes/login.js";
import validate from "./routes/validate.js";
import cheets from "./routes/cheets.js";
import replies from "./routes/replies.js";
import logout from "./routes/logout.js";
import { ExtendedPrismaClient } from "../prisma/prismaClient.js";
import messages from "./routes/messages.js";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

import path from "path";
import cors from "cors";
import conversations from "./routes/conversations.js";
import users from "./routes/users.js";
import { rateLimiter } from "./middleware/rateLimiting.js";
import follow from "./routes/follow.js";
import MySQLStoreImport from "express-mysql-session";
import { errorHandler } from "./middleware/errorHandling.js";

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

export const createApp = (prismaClient: ExtendedPrismaClient, frontendPort: number, projectRoot: string) => {
	const app = express();

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
		app.use(
			cors({
				origin: `http://localhost:${frontendPort}`,
				credentials: true,
			})
		);
	}

	const authLimiter = rateLimiter(1000 * 60, 5);
	const generalLimiter = rateLimiter(1000 * 60 * 10, 1000);

	app.use(express.json());

	app.use("/api/users", generalLimiter, users(prismaClient));
	app.use("/api/follow/:followingId", generalLimiter, follow(prismaClient));
	app.use("/api/register", authLimiter, register(prismaClient));
	app.use("/api/login", authLimiter, login(prismaClient));
	app.use("/api/validate", generalLimiter, validate());
	app.use("/api/logout", generalLimiter, logout());
	app.use("/api/conversations", generalLimiter, conversations(prismaClient));
	// app.use("/api/cheets", generalLimiter, cheets(prismaClient));
	// app.use("/api/users/:userId/cheets", generalLimiter, cheets(prismaClient));
	// app.use("/api/cheets/:cheetId/replies", generalLimiter, replies(prismaClient));
	// app.use("/api/replies", generalLimiter, replies(prismaClient));
	// app.use("/api/messages", generalLimiter, messages(prismaClient));

	app.all("/api/*", (_req, res) => {
		res.status(404).json({ errors: ["Route not found."], code: "ROUTE_NOT_FOUND" });
	});

	if (process.env.NODE_ENV === "prod") {
		const buildPath = path.join(projectRoot, "frontend", "dist");
		app.use(express.static(buildPath));
		app.get("*", (_req, res) => {
			res.sendFile(path.join(buildPath, "index.html"));
		});
	}

	app.use(errorHandler);

	return app
};
