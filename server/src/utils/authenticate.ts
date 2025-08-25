import { Request } from "express";

export const authenticate = (req: Request) => {
	if (
		req.sessionID && 
		req.session.user?.uuid &&
		req.sessionID === req.cookies.session_id &&
		req.session.user.uuid === req.cookies.user_id
	) {
		return true;
	} else {
		return false;
	}
};
