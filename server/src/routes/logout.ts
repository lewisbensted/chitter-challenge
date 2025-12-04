import express, { NextFunction, Request, Response } from "express";

const router = express.Router();

export const logoutHandler = (req: Request, res: Response, next: NextFunction) => {
	if (req.session.user) {
		req.session.destroy((error: unknown) => {
			if (error) {
				console.error("Error logging out:\n");
				next(error);
			} else {
				Object.keys(req.cookies).forEach((key) => {
					res.clearCookie(key);
				});
				res.status(200).json("Logout successful.");
			}
		});
	} else {
		res.status(403).json({ errors: ["Not logged in."] });
	}
};

export default () => {
	const router = express.Router();
	router.delete("/", logoutHandler);
	return router;
};
