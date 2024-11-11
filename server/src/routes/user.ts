// import express, { Request, Response } from "express";
// import { authMiddleware } from "../middleware/authMiddleware.js";
// import { logError } from "../utils/logError.js";
// import { sendErrorResponse } from "../utils/sendErrorResponse.js";
// import { checkUser } from "../utils/checkUser.js";
// import { fetchConversations } from "./messages.js";

// const router = express.Router({ mergeParams: true });

// router.get("/", authMiddleware, async (req: Request, res: Response) => {
//     try {
//         const user = await checkUser(req.params.userId);
//         const conversation = await fetchConversations(req.session.user!.id, user);
//         res.status(200).send(conversation);
//     } catch (error) {
//         console.error("Error retrieving user from the database:\n" + logError(error));
//         sendErrorResponse(error, res);
//     }
// });

// export default router;
