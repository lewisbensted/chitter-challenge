import { Request, Response, NextFunction } from "express";
import { authenticate } from "../utils/authenticate.js";

export const authenticator = (req: Request, res: Response, next: NextFunction) => {
	if (authenticate(req)) {
		next();
	} else {
		res.status(401).json({ errors: ["Unauthorised."] });
	}
};
