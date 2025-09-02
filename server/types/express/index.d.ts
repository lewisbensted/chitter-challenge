import "express-session";

interface SessionUser {
	//id: number;
	uuid: string;
}

declare module "express-session" {
	interface SessionData {
		user?: SessionUser;
	}
}
