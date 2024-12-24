import express, { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { UserSchema } from "../schemas/user.schema.js";
import { ZodError } from "zod";
import bcrypt from "bcrypt";
import { logError } from "../utils/logError.js";
import prisma from "../../prisma/prismaClient.js";

const router = express.Router();
export const registerExtension = Prisma.defineExtension({
    query: {
        user: {
            async create({ args, query }) {
                if (args.data.firstName) {
                    args.data.firstName = args.data.firstName.trim();
                }
                if (args.data.lastName) {
                    args.data.lastName = args.data.lastName.trim();
                }
                args.data = await UserSchema.parseAsync(args.data);
                args.data.password = bcrypt.hashSync(args.data.password, 5);
                return query(args);
            },
        },
    },
});

router.post("/", async (req: Request, res: Response) => {
    try {
        const newUser = await prisma
            .$extends(registerExtension)
            .user.create({ data: req.body, omit: { id: true, password: true } });
        res.status(201).send(newUser);
    } catch (error) {
        console.error("Error saving user to the database:\n" + logError(error));
        if (error instanceof ZodError) {
            res.status(400).send(error.errors.map((err) => err.message));
        } else {
            res.status(500).send(["An unexpected error occured."]);
        }
    }
});

export default router;
