import "express-session";

interface SessionUser {
	id: number;
	username: string;
}

declare module "express-session" {
	interface SessionData {
		user?: SessionUser;
	}
}
