import { z } from "zod";
import type { ExtendedPrismaClient } from "../../prisma/prismaClient.js";
import { isValidName, nameExp1, passwordExp1, passwordExp2 } from "../utils/validation.js";

const isTestEnv = process.env.NODE_ENV === "test";

export const CreateUserSchema = (prismaClient: ExtendedPrismaClient) =>
	z
		.object({
			uuid: z.string().optional(),
			firstName: z
				.string({ required_error: "First name not provided." })
				.trim()
				.superRefine((val, ctx) => {
					if (val.length < 2) {
						ctx.addIssue({
							code: "custom",
							message: "First name too short. Must be at least 2 characters.",
						});
						return;
					}
					if (val.length > 20) {
						ctx.addIssue({
							code: "custom",
							message: "First name too long. Must be fewer than 20 characters.",
						});
						return;
					}
					if (!nameExp1.test(val)) {
						ctx.addIssue({
							code: "custom",
							message: "First name cannot contain numbers or special characters.",
						});
						return;
					}
					if (!isValidName(val)) {
						ctx.addIssue({ code: "custom", message: "Invalid first name format." });
					}
				}),

			lastName: z
				.string({ required_error: "Last name not provided." })
				.trim()
				.superRefine((val, ctx) => {
					if (val.length < 2) {
						ctx.addIssue({
							code: "custom",
							message: "Last name too short. Must be at least 2 characters.",
						});
						return;
					}
					if (val.length > 30) {
						ctx.addIssue({
							code: "custom",
							message: "Last name too long. Must be fewer than 30 characters.",
						});
						return;
					}
					if (!nameExp1.test(val)) {
						ctx.addIssue({
							code: "custom",
							message: "Last name cannot contain numbers or special characters.",
						});
						return;
					}
					if (!isValidName(val)) {
						ctx.addIssue({ code: "custom", message: "Invalid last name format." });
					}
				}),
			email: z
				.string({ required_error: "Email address not provided." })
				.trim()
				.email("Invalid email address.")
				.superRefine(async (val, ctx) => {
					const simpleEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
					if (!simpleEmailRegex.test(val)) return;

					const user = await prismaClient.user.findUnique({ where: { email: val } });
					if (user) {
						ctx.addIssue({ code: "custom", message: "Email address already taken." });
					}
				}),
			username: z
				.string({ required_error: "Username not provided." })
				.trim()
				.superRefine(async (val, ctx) => {
					if (val.length < 5) {
						ctx.addIssue({ code: "custom", message: "Username too short. Must be at least 5 characters." });
						return;
					}
					if (val.length > 30) {
						ctx.addIssue({
							code: "custom",
							message: "Username too long. Must be fewer than 30 characters.",
						});
						return;
					}
					if (/\s/.test(val)) {
						ctx.addIssue({
							code: "custom",
							message: "Username cannot contain spaces.",
						});
						return;
					}
					const user = await prismaClient.user.findUnique({ where: { username: val } });
					if (user) {
						ctx.addIssue({ code: "custom", message: "Username already taken." });
					}
				}),
			password: z
				.string({ required_error: "Password not provided." })
				.min(8, "Password too short. Must be at least 8 characters.")
				.max(30, "Password too long. Must be fewer than 30 characters.")
				.regex(passwordExp1, "Password must contain at least one number, one letter and one special character.")
				.regex(passwordExp2, "Password cannot contain spaces."),
		})
		.omit(isTestEnv ? {} : { uuid: true })
		.strip();
