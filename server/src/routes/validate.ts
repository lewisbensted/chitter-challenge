import express, { Request, Response } from "express";
import { authenticator } from "../middleware/authMiddleware.js";

const router = express.Router();

export const validateHandler = (req: Request, res: Response) => res.status(200).json(req.session.user!.uuid);

router.get("/", authenticator, validateHandler);

export default router;
