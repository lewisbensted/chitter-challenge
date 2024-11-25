import { beforeEach, describe, expect, test, vi } from "vitest";
import { resetDB } from "../resetDB";
import { registerExtension } from "../../routes/register";
import prisma from "../../../prisma/prismaClient";
import { testMessages } from "../fixtures/messages.fixtures";
import { testUser1, testUser2, testUser3, testUser4 } from "../fixtures/users.fixtures";
import messages, { fetchMessages } from "../../routes/messages";
import session from "express-session";
import request from "supertest";
import express from "express";
import { Message } from "@prisma/client";
import conversations, { fetchConversations } from "../../routes/conversations";

describe("Test conversations functionality.", () => {
    vi.mock("./../../middleware/authMiddleware", () => ({
        authMiddleware: vi.fn((req, _res, next) => {
            next();
        }),
    }));

    beforeEach(async () => {
        await resetDB();
        await prisma.user.create({ data: testUser1 });
        await prisma.user.create({ data: testUser2 });
        await prisma.user.create({ data: testUser3 });
        await prisma.user.create({ data: testUser4 });
        await prisma.message.createMany({ data: testMessages });
    });

    const testApp = express();
    testApp.use("/conversations", express.json(), conversations);
    const sessionApp = express();
    sessionApp.use(session({ secret: "secret-key" }));
    sessionApp.all("*", (req, res, next) => {
        req.session.user = { id: 1, uuid: "testuseruuid1" };
        next();
    });
    sessionApp.use(testApp);

    describe("Test fetchConversations function which fetches conversation threads from the database and sorts based on most recent messages.", async () => {
        test("Fetch all testuser1 conversations.", async () => {
            const conversations = await fetchConversations(1);
            expect(conversations).length(2);
            expect(conversations[0]).toEqual({
                interlocutorId: "testuseruuid2",
                interlocutorUsername: "testuser2",
                unread: 2,
            });
            expect(conversations[1]).toEqual({
                interlocutorId: "testuseruuid3",
                interlocutorUsername: "testuser3",
                unread: 1,
            });
        });

        test("Fetch all testuser2 conversations.", async () => {
            const conversations = await fetchConversations(2);
            expect(conversations).length(3);
            expect(conversations[0]).toEqual({
                interlocutorId: "testuseruuid4",
                interlocutorUsername: "testuser4",
                unread: 1,
            });
            expect(conversations[1]).toEqual({
                interlocutorId: "testuseruuid3",
                interlocutorUsername: "testuser3",
                unread: 3,
            });
            expect(conversations[2]).toEqual({
                interlocutorId: "testuseruuid1",
                interlocutorUsername: "testuser1",
                unread: 1,
            });
        });
        test("Fetch all testuser3 conversations.", async () => {
            const conversations = await fetchConversations(3);
            expect(conversations).length(2);
            expect(conversations[0]).toEqual({
                interlocutorId: "testuseruuid2",
                interlocutorUsername: "testuser2",
                unread: 1,
            });
            expect(conversations[1]).toEqual({
                interlocutorId: "testuseruuid1",
                interlocutorUsername: "testuser1",
                unread: 0,
            });
        });
        test("Fetch all testuser4 conversations.", async () => {
            const conversations = await fetchConversations(4);
            expect(conversations).length(1);
            expect(conversations[0]).toEqual({
                interlocutorId: "testuseruuid2",
                interlocutorUsername: "testuser2",
                unread: 0,
            });
        });
        test("Fetch testuser1 individual conversations.", async () => {
            expect(await fetchConversations(1, testUser1)).toEqual([
                { interlocutorId: "testuseruuid1", interlocutorUsername: "testuser1", unread: 0 },
            ]);
            expect(await fetchConversations(1, testUser2)).toEqual([
                { interlocutorId: "testuseruuid2", interlocutorUsername: "testuser2", unread: 2 },
            ]);
            expect(await fetchConversations(1, testUser3)).toEqual([
                { interlocutorId: "testuseruuid3", interlocutorUsername: "testuser3", unread: 1 },
            ]);
            expect(await fetchConversations(1, testUser4)).toEqual([
                { interlocutorId: "testuseruuid4", interlocutorUsername: "testuser4", unread: 0 },
            ]);
        });
        test("Fetch testuser2 individual conversations.", async () => {
            expect(await fetchConversations(2, testUser1)).toEqual([
                { interlocutorId: "testuseruuid1", interlocutorUsername: "testuser1", unread: 1 },
            ]);
            expect(await fetchConversations(2, testUser2)).toEqual([
                { interlocutorId: "testuseruuid2", interlocutorUsername: "testuser2", unread: 0 },
            ]);
            expect(await fetchConversations(2, testUser3)).toEqual([
                { interlocutorId: "testuseruuid3", interlocutorUsername: "testuser3", unread: 3 },
            ]);
            expect(await fetchConversations(2, testUser4)).toEqual([
                { interlocutorId: "testuseruuid4", interlocutorUsername: "testuser4", unread: 1 },
            ]);
        });
        test("Fetch testuser3 individual conversations.", async () => {
            expect(await fetchConversations(3, testUser1)).toEqual([
                { interlocutorId: "testuseruuid1", interlocutorUsername: "testuser1", unread: 0 },
            ]);
            expect(await fetchConversations(3, testUser2)).toEqual([
                { interlocutorId: "testuseruuid2", interlocutorUsername: "testuser2", unread: 1 },
            ]);
            expect(await fetchConversations(3, testUser3)).toEqual([
                { interlocutorId: "testuseruuid3", interlocutorUsername: "testuser3", unread: 0 },
            ]);
            expect(await fetchConversations(3, testUser4)).toEqual([
                { interlocutorId: "testuseruuid4", interlocutorUsername: "testuser4", unread: 0 },
            ]);
        });
        test("Fetch testuser4 individual conversations.", async () => {
            expect(await fetchConversations(4, testUser1)).toEqual([
                { interlocutorId: "testuseruuid1", interlocutorUsername: "testuser1", unread: 0 },
            ]);
            expect(await fetchConversations(4, testUser2)).toEqual([
                { interlocutorId: "testuseruuid2", interlocutorUsername: "testuser2", unread: 0 },
            ]);
            expect(await fetchConversations(4, testUser3)).toEqual([
                { interlocutorId: "testuseruuid3", interlocutorUsername: "testuser3", unread: 0 },
            ]);
            expect(await fetchConversations(4, testUser4)).toEqual([
                { interlocutorId: "testuseruuid4", interlocutorUsername: "testuser4", unread: 0 },
            ]);
        });
    });

    describe("Fetch unread conversations boolean at route: [GET] /unread.", async () => {
        test("Responds with HTTP status 200 and true if there are any unread messages", async () => {
            const { status, body } = await request(sessionApp).get("/conversations/unread");
            expect(status).toEqual(200);
            expect(body).toEqual(true);
        });

        test("Responds with HTTP status 200 and false if there are no unread messages", async () => {
            const sessionAppUser4 = express();
            sessionAppUser4.use(session({ secret: "secret-key" }));
            sessionAppUser4.all("*", (req, res, next) => {
                req.session.user = { id: 4, uuid: "testuseruuid4" };
                next();
            });
            sessionAppUser4.use(testApp);
            const { status, body } = await request(sessionAppUser4).get("/conversations/unread");
            expect(status).toEqual(200);
            expect(body).toEqual(false);
        });
    });

    describe("Fetch conversations at route: [GET] /messages.", async () => {
        test("Responds with HTTP status 200 and all conversations of the session user when no request parameter provided", async () => {
            const { status, body } = await request(sessionApp).get("/conversations");
            expect(status).toEqual(200);
            expect(body).length(2);
            expect(body[0]).toEqual({ interlocutorUsername: "testuser2", interlocutorId: "testuseruuid2", unread: 2 });
            expect(body[1]).toEqual({ interlocutorUsername: "testuser3", interlocutorId: "testuseruuid3", unread: 1 });
        });
        test("Responds with HTTP status 200 and individual conversation when user ID provdied as a parameter.", async () => {
            const request1 = await request(sessionApp).get("/conversations/testuseruuid1");
            expect(request1.status).toEqual(200);
            expect(request1.body).toEqual([
                { interlocutorUsername: "testuser1", interlocutorId: "testuseruuid1", unread: 0 },
            ]);

            const request2 = await request(sessionApp).get("/conversations/testuseruuid2");
            expect(request2.status).toEqual(200);
            expect(request2.body).toEqual([
                { interlocutorUsername: "testuser2", interlocutorId: "testuseruuid2", unread: 2 },
            ]);

            const request3 = await request(sessionApp).get("/conversations/testuseruuid3");
            expect(request3.status).toEqual(200);
            expect(request3.body).toEqual([
                { interlocutorUsername: "testuser3", interlocutorId: "testuseruuid3", unread: 1 },
            ]);

            const request4 = await request(sessionApp).get("/conversations/testuseruuid4");
            expect(request4.status).toEqual(200);
            expect(request4.body).toEqual([
                { interlocutorUsername: "testuser4", interlocutorId: "testuseruuid4", unread: 0 },
            ]);
        });

        test("Responds with HTTP status 404 when the user ID provided does not match a user in the database.", async () => {
            const { status, body } = await request(sessionApp).get("/conversations/testuseruuid5");
            expect(status).toEqual(404);
            expect(body).toEqual(["No User found with ID provided."]);
        });
    });
});
