import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import waitOn from "wait-on";
import { spawn } from "child_process";
import path from "path";

const envFile = path.resolve(process.cwd(), `.env${process.env.NODE_ENV ? "." + process.env.NODE_ENV : ""}`);
dotenvExpand.expand(dotenv.config({ path: envFile }));

const SERVER_PORT = process.env.SERVER_PORT;
if (!SERVER_PORT) {
	console.error("\nError: SERVER_PORT is not defined in your .env file\n");
	process.exit(1);
}

console.log("Waiting for server to start...\n");

waitOn({ resources: [`tcp:${SERVER_PORT}`] }, (err) => {
	if (err) {
		console.error("Error starting server:", err);
		process.exit(1);
	}

	console.log("Starting frontend...");

	const frontend = spawn("npm", ["--prefix", "frontend", "run", "dev"], { stdio: "inherit", shell: true });

	frontend.on("exit", (code) => process.exit(code));
});
