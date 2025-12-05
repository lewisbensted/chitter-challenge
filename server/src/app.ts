import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import register from "./routes/register.js";
import login from "./routes/login.js";
import validate from "./routes/validate.js";
import cheets from "./routes/cheets.js";
import replies from "./routes/replies.js";
import logout from "./routes/logout.js";
import type { ExtendedPrismaClient } from "../prisma/prismaClient.js";
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

export const createApp = (prisma: ExtendedPrismaClient, frontendPort?: number, projectRoot?: string) => {
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

	if (process.env.NODE_ENV === "development") {
		app.use(
			cors({
				origin: `http://localhost:${frontendPort}`,
				credentials: true,
			})
		);
	}

	if (process.env.NODE_ENV === "test") {
		app.use((req, _res, next) => {
			if (!req.session.user && req.headers["session-required"]) {
				req.session.user = { uuid: "testusersessionid" };
				req.cookies.user_id = "testusersessionid";
			}
			next();
		});
	}

	const authLimiter = rateLimiter(1000 * 60, 5);
	const generalLimiter = rateLimiter(1000 * 60 * 10, 1000);

	app.use(express.json());

	app.use("/api/users", generalLimiter, users(prisma));
	app.use("/api/follow/:followingId", generalLimiter, follow(prisma));
	app.use("/api/register", authLimiter, register(prisma));
	app.use("/api/login", authLimiter, login(prisma));
	app.use("/api/validate", generalLimiter, validate());
	app.use("/api/logout", generalLimiter, logout());
	app.use("/api/cheets", generalLimiter, cheets(prisma));
	app.use("/api/conversations", generalLimiter, conversations(prisma));
	app.use("/api/users/:userId/cheets", generalLimiter, cheets(prisma));
	app.use("/api/cheets/:cheetId/replies", generalLimiter, replies(prisma));
	app.use("/api/replies", generalLimiter, replies(prisma));
	app.use("/api/messages", generalLimiter, messages(prisma));

	app.all("/api/*", (_req, res) => {
		res.status(404).json({ errors: ["Route not found."], code: "ROUTE_NOT_FOUND" });
	});

	if (process.env.NODE_ENV === "production" && projectRoot) {
		const buildPath = path.join(projectRoot, "frontend", "dist");
		app.use(express.static(buildPath));
		app.get("*", (_req, res) => {
			res.sendFile(path.join(buildPath, "index.html"));
		});
	}

	app.use(errorHandler);

	return app;
};
