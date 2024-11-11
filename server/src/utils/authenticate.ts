import { Request } from "express";

export const authenticate = (req: Request) => {
    if (req.session.user?.id && req.sessionID == req.cookies.session_id && req.session.user.id == req.cookies.user_id) {
        return true;
    } else {
        return false;
    }
};
