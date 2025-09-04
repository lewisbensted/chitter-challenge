import { z } from "zod";
import prisma from "../../prisma/prismaClient.js";
import type { ExtendedUserClient } from "../../types/extendedClients.js";

export const firstNameExp1 = /^[a-zA-Z -]*$/;
export const firstNameExp2 = /^([^- ]*|[^- ]{2,}(( |-)[^- ]{2,})?)$/; // Maximum of 2 words separated by a hypen or a space.
export const lastNameExp1 = /^[a-zA-Z' -]*$/;
export const lastNameExp2 = /^(([^-' ]')?[^-' ]*|([^-' ]')?[^-' ]{2,}(( |-)([^-' ]')?[^-' ]{2,}){0,2})$/; // Maximum of 3 words separated by a hyphen or a space,
// allow an apostrophe after the first letter of each word.
export const passwordExp1 = /^(?=.*?[a-zA-Z])(?=.*?[0-9])(?=.*?[$&+,:;=?@#|'<>.^*.()%!-/\\]).+$/;
export const passwordExp2 = /^\S*$/;

const isTestEnv = process.env.NODE_ENV === "test";


export const UserSchema = z
	.object({
		id: z.number(),
		uuid: z.string(),
		firstName: z
			.string({ required_error: "First name not provided." })
			.trim()
			.min(2, "First name too short. Must be at least 2 characters.")
			.max(20, "First name too long. Must be less than 20 characters.")
			.regex(firstNameExp1, "First name cannot contain numbers or special characters.")
			.regex(firstNameExp2, "Invalid first name format."),
		lastName: z
			.string({ required_error: "Last name not provided." })
			.trim()
			.min(2, "Last name too short. Must be at least 2 characters.")
			.max(30, "Last name too long. Must be less than 20 characters.")
			.regex(lastNameExp1, "Last name cannot contain numbers or special characters.")
			.regex(lastNameExp2, "Invalid last name format."),
		email: z
			.string({ required_error: "Email address not provided." })
			.trim()
			.email("Invalid email address.")
			.refine(async (email) => {
				const userClient = prisma.user as unknown as ExtendedUserClient;
				const user = await userClient.findUnique({ where: { email: email } });
				return !user;
			}, "Email address already taken."),
		username: z
			.string({ required_error: "Username not provided." })
			.trim()
			.min(5, "Username too short. Must be at least 5 characters.")
			.max(30, "Username too long. Must be less than 30 characters.")
			.refine(async (username) => {
				const userClient = prisma.user as unknown as ExtendedUserClient;
				const user = await userClient.findUnique({
					where: { username: username },
				});
				return !user;
			}, "Username already taken."),
		password: z
			.string({ required_error: "Password not provided." })
			.min(8, "Password too short. Must be at least 8 characters.")
			.max(30, "Password too long. Must be less than 30 characters.")
			.regex(passwordExp1, "Password must contain at least one number, one letter and one special character.")
			.regex(passwordExp2, "Password cannot contain spaces."),
	})
	.omit(isTestEnv ? {} : { id: true, uuid: true })
	.strip();
