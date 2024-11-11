import { beforeEach, describe, expect, test } from "vitest";
import { resetDB } from "../resetDB";
import { registerExtension } from "../../routes/register";
import prisma from "../../../prisma/prismaClient";
import { testUser1, testUser2 } from "../fixtures/users.fixtures";
import { messageExtension } from "../../routes/messages";
import { testMessages } from "../fixtures/messages.fixtures";
import { checkMessage } from "../../utils/checkMessage";

describe("Test checkMessage function which validates that a message exists.", () => {
    beforeEach(async () => {
        await resetDB();
        await prisma.$extends(registerExtension).user.create({ data: testUser1 });
        await prisma.$extends(registerExtension).user.create({ data: testUser2 });
        await prisma.$extends(messageExtension).message.create({ data: testMessages[0] });
    });
    test("Valid message id provided.", async () => {
        const message = await checkMessage("1");
        expect([message.id, message.text, message.senderUsername, message.recipientUsername]).toEqual([
            1,
            "test message from testuser1 to testuser2",
            "testuser1",
            "testuser2",
        ]);
    });
    test("No cheet with ID provided.", async () => {
        await expect(checkMessage("2")).rejects.toThrowError("No Message found");
    });
    test("Invalid cheetId provided.", async () => {
        await expect(checkMessage("two")).rejects.toThrowError("Invalid message ID provided - must be a number.");
    });
});
