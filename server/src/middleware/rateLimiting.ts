import rateLimit from "express-rate-limit";

export const rateLimiter = (time: number, max: number) => rateLimit({
	windowMs: time,
	max: max,
	handler: (_req, res) => {
		res.status(429).json({
			errors: ["Too many requests, please try again later."],
		});
	},
});
