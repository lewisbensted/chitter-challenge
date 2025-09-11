import { Request, Response, NextFunction } from "express";
import { authenticate } from "../utils/authenticate.js";

export const authenticater = (req: Request, res: Response, next: NextFunction) => {
	if (authenticate(req)) {
		next();
	} else {
		res.status(401).json({ errors: ["Invalid credentials."] });
	}
};
