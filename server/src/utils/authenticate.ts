import { Request } from "express";

export const authenticate = (req: Request) => {
    if (
        req.session.user?.uuid &&
        req.sessionID == req.cookies.session?.substring(2, req.cookies.session.indexOf(".")) &&
        req.session.user.uuid == req.cookies.user_id
    ) {
        return true;
    } else {
        return false;
    }
};
