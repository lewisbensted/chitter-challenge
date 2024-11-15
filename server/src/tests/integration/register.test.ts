import { beforeEach, expect, test, describe } from "vitest";
import prisma from "../../../prisma/prismaClient";
import { resetDB } from "../resetDB";
import request from "supertest";
import express from "express";
import register from "../../routes/register";
import {
    testUser1,
    testUserBadRegex,
    testUserDuplicateEmail,
    testUserDuplicateUsername,
    testUserMissingField,
    testUserMultipleFailures,
} from "../fixtures/users.fixtures";

describe("Register a new user at route: [POST] /register.", async () => {
    beforeEach(async () => {
        await resetDB();
    });
    const testApp = express();
    testApp.use("/register", express.json(), register);

    test("Responds with HTTP status 201 and new user information when a user is succesfully created.", async () => {
        const { status, body } = await request(testApp).post("/register").send(testUser1);
        const newUser = await prisma.user.findFirst();
        expect(status).toEqual(201);
        expect(newUser).not.toBeNull();
        expect(newUser).toStrictEqual(body);
        expect(newUser!.firstName).toEqual("Test");
        expect(newUser!.lastName).toEqual("User");
    });
    test("Responds with HTTP status 400 if a user already exists with the provided email address.", async () => {
        await prisma.user.create({ data: testUser1 });
        const { status, body } = await request(testApp).post("/register").send(testUserDuplicateEmail);
        const count = await prisma.user.count();
        expect(status).toEqual(400);
        expect(count).toEqual(1);
        expect(body).toEqual(["Email address already taken."]);
    });
    test("Responds with HTTP status 400 if a user already exists with the provided username.", async () => {
        await prisma.user.create({ data: testUser1 });
        const { status, body } = await request(testApp).post("/register").send(testUserDuplicateUsername);
        const count = await prisma.user.count();
        expect(status).toEqual(400);
        expect(count).toEqual(1);
        expect(body).toEqual(["Username already taken."]);
    });
    test("Responds with HTTP status 400 if the request body is missing a field.", async () => {
        const { status, body } = await request(testApp).post("/register").send(testUserMissingField);
        const count = await prisma.user.count();
        expect(status).toEqual(400);
        expect(count).toEqual(0);
        expect(body).toEqual(["Last name not provided."]);
    });
    test("Responds with HTTP status 400 if regex validations fail.", async () => {
        const { status, body } = await request(testApp).post("/register").send(testUserBadRegex);
        const count = await prisma.user.count();
        expect(status).toEqual(400);
        expect(count).toEqual(0);
        expect(body.length).toEqual(5);
        expect(body).toContain("Password must contain at least one number, one letter and one special character.");
        expect(body).toContain("Password cannot contain spaces.");
        expect(body).toContain("First name cannot contain numbers or special characters.");
        expect(body).toContain("Last name cannot contain numbers or special characters.");
        expect(body).toContain("Invalid last name format.");
    });
    test("Responds with HTTP status 400 if multiple validations fail at the same time.", async () => {
        await prisma.user.create({ data: testUser1 });
        const { status, body } = await request(testApp).post("/register").send(testUserMultipleFailures);
        expect(status).toEqual(400);
        expect(body.length).toEqual(4);
        expect(body).toContain("First name not provided.");
        expect(body).toContain("Username already taken.");
        expect(body).toContain("Invalid email address.");
        expect(body).toContain("Last name cannot contain numbers or special characters.");
    });
});
