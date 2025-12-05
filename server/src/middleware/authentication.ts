import { Request, Response, NextFunction } from "express";

export const authenticator = (req: Request, res: Response, next: NextFunction) => {
	if (!!req.session.user?.uuid && req.session.user.uuid === req.cookies?.user_id) {
		next();
	} else {
		res.status(401).json({ errors: ["Unauthorised."] });
	}
};