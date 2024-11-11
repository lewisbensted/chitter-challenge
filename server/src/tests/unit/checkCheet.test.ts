import { beforeEach, describe, expect, test } from "vitest";
import { resetDB } from "../resetDB";
import { registerExtension } from "../../routes/register";
import prisma from "../../../prisma/prismaClient";
import { testUser1 } from "../fixtures/users.fixtures";
import { checkCheet } from "../../utils/checkCheet";
import { cheetExtension } from "../../routes/cheets";
import { testCheets } from "../fixtures/cheets.fixtures";

describe("Test checkCheet function which validates that a cheet exists.", () => {
    beforeEach(async () => {
        await resetDB();
        await prisma.$extends(registerExtension).user.create({ data: testUser1 });
        await prisma.$extends(cheetExtension).cheet.create({ data: testCheets[0] });
    });
    test("Valid cheet id provided.", async () => {
        const cheet = await checkCheet("1");
        expect([cheet.id, cheet.text, cheet.username]).toEqual([1, "test cheet 1", "testuser1"]);
    });
    test("No cheet with ID provided.", async () => {
        await expect(checkCheet("2")).rejects.toThrowError("No Cheet found");
    });
    test("Invalid cheetId provided.", async () => {
        await expect(checkCheet("two")).rejects.toThrowError("Invalid cheet ID provided - must be a number.");
    });
});
