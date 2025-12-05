import "express-session";

interface SessionUser {
	uuid: string;
}

declare module "express-session" {
	interface SessionData {
		user?: SessionUser;
	}
}

