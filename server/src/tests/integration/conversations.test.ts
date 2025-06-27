import { beforeEach, describe, expect, test, vi } from "vitest";
import { resetDB } from "../../../prisma/resetDB";
import prisma from "../../../prisma/prismaClient";
import { testMessages } from "../fixtures/messages.fixtures";
import { testUser1, testUser2, testUser3, testUser4 } from "../fixtures/users.fixtures";
import session from "express-session";
import request from "supertest";
import express, { NextFunction } from "express";
import conversations, { fetchConversations } from "../../routes/conversations";
import { IConversation } from "../../../types/responses";

interface IResponse {
	status: number;
	body: IConversation[];
}

describe("Test conversations functionality.", () => {
	vi.mock("./../../utils/authenticate", () => ({
		authenticate: vi.fn().mockImplementation(() => true),
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
	testApp.use(session({ secret: "secret-key" }));
	testApp.all("*", (req, _res, next: NextFunction) => {
		req.session.user = { id: 1, uuid: "testuseruuid1" };
		next();
	});
	testApp.use("/conversations", express.json(), conversations);

	describe("Test fetchConversations function which fetches conversation threads from the database and sorts based on most recent messages.", () => {
		test("Fetch all testuser1 conversations.", async () => {
			const conversations = await fetchConversations(1);
			expect(conversations).length(2);
			expect(conversations[0]).toEqual({
				interlocutorId: "testuseruuid2",
				interlocutorUsername: "testuser2",
				unread: 2,
				latestMessage: {
					text: "second test message from testuser2 to testuser1",
					isRead: false,
					senderId: "testuseruuid2",
				},
			});
			expect(conversations[1]).toEqual({
				interlocutorId: "testuseruuid3",
				interlocutorUsername: "testuser3",
				unread: 1,
				latestMessage: {
					text: "third test message from testuser3 to testuser1",
					isRead: false,
					senderId: "testuseruuid3",
				},
			});
		});

		test("Fetch all testuser2 conversations.", async () => {
			const conversations = await fetchConversations(2);
			expect(conversations).length(3);
			expect(conversations[0]).toEqual({
				interlocutorId: "testuseruuid4",
				interlocutorUsername: "testuser4",
				unread: 1,
				latestMessage: {
					text: "test message from testuser2 to testuser4",
					isRead: true,
					senderId: "testuseruuid2",
				},
			});
			expect(conversations[1]).toEqual({
				interlocutorId: "testuseruuid3",
				interlocutorUsername: "testuser3",
				unread: 3,
				latestMessage: {
					text: "third test message from testuser3 to testuser2",
					isRead: false,
					senderId: "testuseruuid3",
				},
			});
			expect(conversations[2]).toEqual({
				interlocutorId: "testuseruuid1",
				interlocutorUsername: "testuser1",
				unread: 1,
				latestMessage: {
					text: "second test message from testuser2 to testuser1",
					isRead: false,
					senderId: "testuseruuid2",
				},
			});
		});
		test("Fetch all testuser3 conversations.", async () => {
			const conversations = await fetchConversations(3);
			expect(conversations).length(2);
			expect(conversations[0]).toEqual({
				interlocutorId: "testuseruuid2",
				interlocutorUsername: "testuser2",
				unread: 1,
				latestMessage: {
					text: "third test message from testuser3 to testuser2",
					isRead: false,
					senderId: "testuseruuid3",
				},
			});
			expect(conversations[1]).toEqual({
				interlocutorId: "testuseruuid1",
				interlocutorUsername: "testuser1",
				unread: 0,
				latestMessage: {
					text: "third test message from testuser3 to testuser1",
					isRead: false,
					senderId: "testuseruuid3",
				},
			});
		});
		test("Fetch all testuser4 conversations.", async () => {
			const conversations = await fetchConversations(4);
			expect(conversations).length(1);
			expect(conversations[0]).toEqual({
				interlocutorId: "testuseruuid2",
				interlocutorUsername: "testuser2",
				unread: 0,
				latestMessage: {
					text: "test message from testuser2 to testuser4",
					isRead: true,
					senderId: "testuseruuid2",
				},
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

	describe("Fetch conversations at route: [GET] /conversations.", () => {
		test("Responds with HTTP status 200 and all conversations of the session user when no request parameter provided", async () => {
			const { status, body } = (await request(testApp).get("/conversations")) as IResponse;
			expect(status).toEqual(200);
			expect(body).length(2);
			expect(body[0]).toMatchObject({
				interlocutorId: "testuseruuid2",
			});
			expect(body[1]).toMatchObject({
				interlocutorId: "testuseruuid3",
			});
		});
		test("Responds with HTTP status 200 and individual conversation when user ID provdied as a parameter.", async () => {
			const request1 = (await request(testApp).get("/conversations/testuseruuid1")) as IResponse;
			expect(request1.status).toEqual(200);
			expect(request1.body).toMatchObject({
				conversation: { interlocutorId: "testuseruuid1" },
				username: "testuser1",
			});

			const request2 = (await request(testApp).get("/conversations/testuseruuid2")) as IResponse;
			expect(request2.status).toEqual(200);
			expect(request2.body).toMatchObject({
				conversation: { interlocutorId: "testuseruuid2" },
				username: "testuser2",
			});

			const request3 = (await request(testApp).get("/conversations/testuseruuid3")) as IResponse;
			expect(request3.status).toEqual(200);
			expect(request3.body).toMatchObject({
				conversation: { interlocutorId: "testuseruuid3" },
				username: "testuser3",
			});

			const request4 = (await request(testApp).get("/conversations/testuseruuid4")) as IResponse;
			expect(request4.status).toEqual(200);
			expect(request4.body).toMatchObject({
				conversation: { interlocutorId: "testuseruuid4" },
				username: "testuser4",
			});
		});

		test("Responds with HTTP status 404 when the user ID provided does not match a user in the database.", async () => {
			const { status, body } = (await request(testApp).get("/conversations/testuseruuid5")) as IResponse;
			expect(status).toEqual(404);
			expect(body).toEqual(["Expected a record, found none."]);
		});
	});
});
