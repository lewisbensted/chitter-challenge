import { logError } from "./../utils/logError.js";
import { sendErrorResponse } from "../utils/sendErrorResponse.js";
import { NextFunction, Request, Response } from "express";

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
	logError(err);
	sendErrorResponse(err, res);
};
