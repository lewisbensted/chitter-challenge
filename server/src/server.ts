import { logError } from "./utils/logError.js";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import path from "path";
import { PrismaClientInitializationError } from "@prisma/client/runtime/library.js";
import { createApp } from "./app.js";
import prisma from "../prisma/prismaClient.js";

dotenvExpand.expand(dotenv.config({ path: `../.env${process.env.NODE_ENV ? "." + process.env.NODE_ENV : ""}` }));

const __dirname = import.meta.dirname;

const checkValidPort = (port: number, side: string) => {
	if (Number.isNaN(port) || port < 0 || port > 65535)
		throw new TypeError(`Invalid ${side} port provided - must be a number between 0 and 65535.`);
};

try {
    
	await prisma.$connect();

	const FRONTEND_PORT = process.env.PORT ? Number(process.env.PORT) : 5173;
	const SERVER_PORT = Number(process.env.SERVER_PORT);
	const PROJECT_ROOT = path.resolve(__dirname, "../../..");

	checkValidPort(SERVER_PORT, "server");
	if (process.env.NODE_ENV !== "prod") checkValidPort(FRONTEND_PORT, "frontend");

	const app = createApp(prisma, FRONTEND_PORT, PROJECT_ROOT);

	app.listen(SERVER_PORT, () => {
		console.log(`\nServer running on port ${SERVER_PORT}.\n`);
	}).on("error", (error: unknown) => {
		console.error(logError(error));
	});
} catch (error) {
	console.error(
		(error instanceof PrismaClientInitializationError ? "\nError initialising database connection:\n" : "") +
			logError(error)
	);
}
