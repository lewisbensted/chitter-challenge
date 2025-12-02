import { afterEach, describe, expect, test, vi } from "vitest";
import { CreateUserSchema } from "../../../src/schemas/user.schema";
import { prismaMock } from "../../test-utils/prismaMock";
import * as validation from "../../../src/utils/validation";
import { ExtendedPrismaClient } from "../../../prisma/prismaClient";

describe("User schema", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});
	test("Success", async () => {
		vi.spyOn(validation, "isValidName").mockReturnValue(true);
		prismaMock.user.findUnique.mockResolvedValue(null);
		const validUser = {
			firstName: "Mock",
			lastName: "User",
			email: "mockuser1@hotmail.com",
			username: "mockuser1",
			password: "password1!",
		};
		await expect(CreateUserSchema(prismaMock as unknown as ExtendedPrismaClient).parseAsync(validUser)).resolves.toEqual(
			validUser
		);
	});
	describe("First name", () => {
		test("Too short", async () => {
			vi.spyOn(validation, "isValidName").mockReturnValue(true);
			prismaMock.user.findUnique.mockResolvedValue(null);
			const testUser = {
				firstName: "M",
				lastName: "User",
				email: "mockuser1@hotmail.com",
				username: "mockuser1",
				password: "password1!",
			};
			await expect(
				CreateUserSchema(prismaMock as unknown as ExtendedPrismaClient).parseAsync(testUser)
			).rejects.toMatchObject({
				issues: [
					{
						path: ["firstName"],
						message: "First name too short. Must be at least 2 characters.",
					},
				],
			});
		});
		test("Too long", async () => {
			vi.spyOn(validation, "isValidName").mockReturnValue(true);
			prismaMock.user.findUnique.mockResolvedValue(null);
			const testUser = {
				firstName: "Mockmockmockmockmockmockmockm",
				lastName: "User",
				email: "mockuser1@hotmail.com",
				username: "mockuser1",
				password: "password1!",
			};
			await expect(
				CreateUserSchema(prismaMock as unknown as ExtendedPrismaClient).parseAsync(testUser)
			).rejects.toMatchObject({
				issues: [
					{
						path: ["firstName"],
						message: "First name too long. Must be fewer than 20 characters.",
					},
				],
			});
		});
		test("Invalid chars", async () => {
			vi.spyOn(validation, "isValidName").mockReturnValue(true);
			prismaMock.user.findUnique.mockResolvedValue(null);
			const testUser = {
				firstName: "Mo1ck",
				lastName: "User",
				email: "mockuser1@hotmail.com",
				username: "mockuser1",
				password: "password1!",
			};
			await expect(
				CreateUserSchema(prismaMock as unknown as ExtendedPrismaClient).parseAsync(testUser)
			).rejects.toMatchObject({
				issues: [
					{
						path: ["firstName"],
						message: "First name cannot contain numbers or special characters.",
					},
				],
			});
		});
		test("Invalid format", async () => {
			vi.spyOn(validation, "isValidName").mockReturnValueOnce(false);
			prismaMock.user.findUnique.mockResolvedValue(null);
			const testUser = {
				firstName: "Mock",
				lastName: "User",
				email: "mockuser1@hotmail.com",
				username: "mockuser1",
				password: "password1!",
			};
			await expect(
				CreateUserSchema(prismaMock as unknown as ExtendedPrismaClient).parseAsync(testUser)
			).rejects.toMatchObject({
				issues: [
					{
						path: ["firstName"],
						message: "Invalid first name format.",
					},
				],
			});
		});
	});
	describe("Last name", () => {
		test("Too short", async () => {
			vi.spyOn(validation, "isValidName").mockReturnValue(true);
			prismaMock.user.findUnique.mockResolvedValue(null);
			const testUser = {
				firstName: "Mock",
				lastName: "U",
				email: "mockuser1@hotmail.com",
				username: "mockuser1",
				password: "password1!",
			};
			await expect(
				CreateUserSchema(prismaMock as unknown as ExtendedPrismaClient).parseAsync(testUser)
			).rejects.toMatchObject({
				issues: [
					{
						path: ["lastName"],
						message: "Last name too short. Must be at least 2 characters.",
					},
				],
			});
		});
		test("Too long", async () => {
			vi.spyOn(validation, "isValidName").mockReturnValue(true);
			prismaMock.user.findUnique.mockResolvedValue(null);
			const testUser = {
				firstName: "Mock",
				lastName: "Useruseruseruseruseruseruseruse",
				email: "mockuser1@hotmail.com",
				username: "mockuser1",
				password: "password1!",
			};
			await expect(
				CreateUserSchema(prismaMock as unknown as ExtendedPrismaClient).parseAsync(testUser)
			).rejects.toMatchObject({
				issues: [
					{
						path: ["lastName"],
						message: "Last name too long. Must be fewer than 30 characters.",
					},
				],
			});
		});
		test("Invalid chars", async () => {
			vi.spyOn(validation, "isValidName").mockReturnValue(true);
			prismaMock.user.findUnique.mockResolvedValue(null);
			const testUser = {
				firstName: "Mock",
				lastName: "Us1er",
				email: "mockuser1@hotmail.com",
				username: "mockuser1",
				password: "password1!",
			};
			await expect(
				CreateUserSchema(prismaMock as unknown as ExtendedPrismaClient).parseAsync(testUser)
			).rejects.toMatchObject({
				issues: [
					{
						path: ["lastName"],
						message: "Last name cannot contain numbers or special characters.",
					},
				],
			});
		});
		test("Invalid format", async () => {
			vi.spyOn(validation, "isValidName").mockReturnValueOnce(true).mockReturnValueOnce(false);
			prismaMock.user.findUnique.mockResolvedValue(null);
			const testUser = {
				firstName: "Mock",
				lastName: "User",
				email: "mockuser1@hotmail.com",
				username: "mockuser1",
				password: "password1!",
			};
			await expect(
				CreateUserSchema(prismaMock as unknown as ExtendedPrismaClient).parseAsync(testUser)
			).rejects.toMatchObject({
				issues: [
					{
						path: ["lastName"],
						message: "Invalid last name format.",
					},
				],
			});
		});
	});
	describe("Email", () => {
		test("Early exit on invalid email", async () => {
			vi.spyOn(validation, "isValidName").mockReturnValue(true);
			const testUser = {
				firstName: "Mock",
				lastName: "User",
				email: "mockuser1hotmail.com",
				username: "mockuser1",
				password: "password1!",
			};
			await expect(
				CreateUserSchema(prismaMock as unknown as ExtendedPrismaClient).parseAsync(testUser)
			).rejects.toMatchObject({
				issues: [
					{
						path: ["email"],
						message: "Invalid email address.",
					},
				],
			});
			expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
			expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { username: "mockuser1" } });
		});
		test("Already exists", async () => {
			vi.spyOn(validation, "isValidName").mockReturnValue(true);
			prismaMock.user.findUnique.mockResolvedValueOnce({ uuid: "mockuserid" });
			const testUser = {
				firstName: "Mock",
				lastName: "User",
				email: "mockuser1@hotmail.com",
				username: "mockuser1",
				password: "password1!",
			};
			await expect(
				CreateUserSchema(prismaMock as unknown as ExtendedPrismaClient).parseAsync(testUser)
			).rejects.toMatchObject({
				issues: [
					{
						path: ["email"],
						message: "Email address already taken.",
					},
				],
			});
		});
	});
	describe("Username", () => {
		test("Too short", async () => {
			vi.spyOn(validation, "isValidName").mockReturnValue(true);
			prismaMock.user.findUnique.mockResolvedValue(null);
			const testUser = {
				firstName: "Mock",
				lastName: "User",
				email: "mockuser1@hotmail.com",
				username: "mock",
				password: "password1!",
			};
			await expect(
				CreateUserSchema(prismaMock as unknown as ExtendedPrismaClient).parseAsync(testUser)
			).rejects.toMatchObject({
				issues: [
					{
						path: ["username"],
						message: "Username too short. Must be at least 5 characters.",
					},
				],
			});
		});
		test("Too long", async () => {
			vi.spyOn(validation, "isValidName").mockReturnValue(true);
			prismaMock.user.findUnique.mockResolvedValue(null);
			const testUser = {
				firstName: "Mock",
				lastName: "User",
				email: "mockuser1@hotmail.com",
				username: "mockusermockusermockusermockuser",
				password: "password1!",
			};
			await expect(
				CreateUserSchema(prismaMock as unknown as ExtendedPrismaClient).parseAsync(testUser)
			).rejects.toMatchObject({
				issues: [
					{
						path: ["username"],
						message: "Username too long. Must be fewer than 30 characters.",
					},
				],
			});
		});
		test("Contains spaces", async () => {
			vi.spyOn(validation, "isValidName").mockReturnValue(true);
			prismaMock.user.findUnique.mockResolvedValue(null);
			const testUser = {
				firstName: "Mock",
				lastName: "User",
				email: "mockuser1@hotmail.com",
				username: "mock user",
				password: "password1!",
			};
			await expect(
				CreateUserSchema(prismaMock as unknown as ExtendedPrismaClient).parseAsync(testUser)
			).rejects.toMatchObject({
				issues: [
					{
						path: ["username"],
						message: "Username cannot contain spaces.",
					},
				],
			});
		});
		test("Already exists", async () => {
			vi.spyOn(validation, "isValidName").mockReturnValue(true);
			prismaMock.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({ uuid: "mockuserid" });
			const testUser = {
				firstName: "Mock",
				lastName: "User",
				email: "mockuser1@hotmail.com",
				username: "mockuser",
				password: "password1!",
			};
			await expect(
				CreateUserSchema(prismaMock as unknown as ExtendedPrismaClient).parseAsync(testUser)
			).rejects.toMatchObject({
				issues: [
					{
						path: ["username"],
						message: "Username already taken.",
					},
				],
			});
		});
	});
});
