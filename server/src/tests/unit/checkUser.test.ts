import { beforeEach, describe, expect, test } from "vitest";
import { checkUser } from "../../utils/checkUser";
import { resetDB } from "../resetDB";
import { registerExtension } from "../../routes/register";
import prisma from "../../../prisma/prismaClient";
import { testUser1 } from "../fixtures/users.fixtures";

describe("Test checkUser function which validates that a user exists.", () => {
    beforeEach(async () => {
        await resetDB();
        await prisma.$extends(registerExtension).user.create({ data: testUser1 });
    });
    test("Valid user id provided.", async () => {
        const user = await checkUser("1");
        expect([user.id, user.firstName, user.lastName]).toEqual([1, "Test", "User"]);
    });
    test("No user with ID provided.", async () => {
        await expect(checkUser("2")).rejects.toThrowError("No User found");
    });
    test("Invalid userId provided.", async () => {
        await expect(checkUser("two")).rejects.toThrowError("Invalid user ID provided - must be a number.");
    });
    test("Invalid userId provided.", async () => {
        await expect(checkUser("two", "recipient")).rejects.toThrowError(
            "Invalid recipient ID provided - must be a number."
        );
    });
});
