import { beforeEach, describe, expect, test, vi } from "vitest";
import { resetDB } from "../../../prisma/resetDB";
import prisma from "../../../prisma/prismaClient";
import { testMessages } from "../fixtures/messages.fixtures";
import { testUser1, testUser2, testUser3, testUser4 } from "../fixtures/users.fixtures";
import messages, { fetchMessages, readMessages } from "../../routes/messages";
import session from "express-session";
import request from "supertest";
import express, { NextFunction } from "express";
import { IMessage } from "../../../types/responses";

interface IResponse {
	status: number;
	body: IMessage[] | string[];
}

function isMessage(body: IMessage | string): body is IMessage {
	return (body as IMessage).uuid ? true : false;
}

describe("test message functionality.", () => {
	vi.mock("./../../middleware/authMiddleware", () => ({
		authMiddleware: vi.fn((_req, _res, next: NextFunction) => {
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
	testApp.use(session({ secret: "secret-key", saveUninitialized: false, resave: false }));
	testApp.all("*", (req, _res, next: NextFunction) => {
		req.session.user = { id: 1, uuid: "testuseruuid1" };
		next();
	});
	testApp.use("/messages", express.json(), messages);

	describe("Test fetchMessages function which fetches relevant messages from the database and sorts them in chronological order.", () => {
		test("Fetch messages between testuser1 and testuser2.", async () => {
			const messages = await fetchMessages(1, 2);
			expect(messages).length(4);
			expect(messages[0]).toMatchObject({
				sender: { uuid: "testuseruuid1" },
				recipient: { uuid: "testuseruuid2" },
				uuid: "testmessageuuid1",
				text: "test message from testuser1 to testuser2",
			});
			expect(messages[1]).toMatchObject({
				sender: { uuid: "testuseruuid2" },
				recipient: { uuid: "testuseruuid1" },
				uuid: "testmessageuuid4",
				text: "test message from testuser2 to testuser1",
			});
			expect(messages[2]).toMatchObject({
				sender: { uuid: "testuseruuid1" },
				recipient: { uuid: "testuseruuid2" },
				uuid: "testmessageuuid2",
				text: "second test message from testuser1 to testuser2",
			});
			expect(messages[3]).toMatchObject({
				sender: { uuid: "testuseruuid2" },
				recipient: { uuid: "testuseruuid1" },
				uuid: "testmessageuuid5",
				text: "second test message from testuser2 to testuser1",
			});
		});
		test("Fetch messages between testuser1 and testuser3.", async () => {
			const messages = await fetchMessages(1, 3);
			expect(messages).length(4);
			expect(messages[0]).toMatchObject({
				sender: { uuid: "testuseruuid3" },
				recipient: { uuid: "testuseruuid1" },
				uuid: "testmessageuuid8",
				text: "test message from testuser3 to testuser1",
			});
			expect(messages[1]).toMatchObject({
				sender: { uuid: "testuseruuid1" },
				recipient: { uuid: "testuseruuid3" },
				uuid: "testmessageuuid3",
				text: "test message from testuser1 to testuser3",
			});
			expect(messages[2]).toMatchObject({
				sender: { uuid: "testuseruuid3" },
				recipient: { uuid: "testuseruuid1" },
				uuid: "testmessageuuid9",
				text: "second test message from testuser3 to testuser1",
			});
			expect(messages[3]).toMatchObject({
				sender: { uuid: "testuseruuid3" },
				recipient: { uuid: "testuseruuid1" },
				uuid: "testmessageuuid10",
				text: "third test message from testuser3 to testuser1",
			});
		});
		test("Fetch messages between testuser1 and testuser4.", async () => {
			const messages = await fetchMessages(1, 4);
			expect(messages).length(0);
		});
		test("Fetch messages between testuser2 and testuser3.", async () => {
			const messages = await fetchMessages(2, 3);
			expect(messages).length(5);
			expect(messages[0]).toMatchObject({
				sender: { uuid: "testuseruuid2" },
				recipient: { uuid: "testuseruuid3" },
				uuid: "testmessageuuid6",
				text: "test message from testuser2 to testuser3",
			});
			expect(messages[1]).toMatchObject({
				sender: { uuid: "testuseruuid2" },
				recipient: { uuid: "testuseruuid3" },
				uuid: "testmessageuuid7",
				text: "second test message from testuser2 to testuser3",
			});
			expect(messages[2]).toMatchObject({
				sender: { uuid: "testuseruuid3" },
				recipient: { uuid: "testuseruuid2" },
				uuid: "testmessageuuid11",
				text: "test message from testuser3 to testuser2",
			});
			expect(messages[3]).toMatchObject({
				sender: { uuid: "testuseruuid3" },
				recipient: { uuid: "testuseruuid2" },
				uuid: "testmessageuuid12",
				text: "second test message from testuser3 to testuser2",
			});
			expect(messages[4]).toMatchObject({
				sender: { uuid: "testuseruuid3" },
				recipient: { uuid: "testuseruuid2" },
				uuid: "testmessageuuid13",
				text: "third test message from testuser3 to testuser2",
			});
		});
		test("Fetch messages between testuser2 and testuser4.", async () => {
			const messages = await fetchMessages(2, 4);
			expect(messages).length(2);
			expect(messages[0]).toMatchObject({
				sender: { uuid: "testuseruuid4" },
				recipient: { uuid: "testuseruuid2" },
				uuid: "testmessageuuid14",
				text: "test message from testuser4 to testuser2",
			});
			expect(messages[1]).toMatchObject({
				sender: { uuid: "testuseruuid2" },
				recipient: { uuid: "testuseruuid4" },
				uuid: "testmessageuuid15",
				text: "test message from testuser2 to testuser4",
			});
		});
		test("Fetch messages between testuser2 and testuser3.", async () => {
			const messages = await fetchMessages(3, 4);
			expect(messages).length(0);
		});
	});

	describe("Test readMessages function which sets the read value of relevant messages to true.", () => {
		test("testuser1 reads all messages from testuser2.", async () => {
			const read = await readMessages(1, 2);
			expect(read.count).toEqual(2);
			const updatedMessages = await prisma.message.findMany({
				where: {
					recipientId: 1,
					senderId: 2,
				},
			});
			expect(updatedMessages.filter((message) => !message.isRead)).toEqual([]);
		});
		test("testuser1 reads all messages from testuser3.", async () => {
			const read = await readMessages(1, 3);
			expect(read.count).toEqual(3);
			const updatedMessages = await prisma.message.findMany({
				where: {
					recipientId: 1,
					senderId: 3,
				},
			});
			expect(updatedMessages.filter((message) => !message.isRead)).toEqual([]);
		});
		test("testuser1 reads all messages from testuser4.", async () => {
			const read = await readMessages(1, 4);
			expect(read.count).toEqual(0);
			const updatedMessages = await prisma.message.findMany({
				where: {
					recipientId: 1,
					senderId: 4,
				},
			});
			expect(updatedMessages.filter((message) => !message.isRead)).toEqual([]);
		});
		test("testuser2 reads all messages from testuser1.", async () => {
			const read = await readMessages(2, 1);
			expect(read.count).toEqual(2);
			const updatedMessages = await prisma.message.findMany({
				where: {
					recipientId: 2,
					senderId: 1,
				},
			});
			expect(updatedMessages.filter((message) => !message.isRead)).toEqual([]);
		});
		test("testuser2 reads all messages from testuser3.", async () => {
			const read = await readMessages(2, 3);
			expect(read.count).toEqual(3);
			const updatedMessages = await prisma.message.findMany({
				where: {
					recipientId: 2,
					senderId: 3,
				},
			});
			expect(updatedMessages.filter((message) => !message.isRead)).toEqual([]);
		});
		test("testuser2 reads all messages from testuser4.", async () => {
			const read = await readMessages(2, 4);
			expect(read.count).toEqual(1);
			const updatedMessages = await prisma.message.findMany({
				where: {
					recipientId: 2,
					senderId: 4,
				},
			});
			expect(updatedMessages.filter((message) => !message.isRead)).toEqual([]);
		});
		test("testuser3 reads all messages from testuser1.", async () => {
			const read = await readMessages(3, 1);
			expect(read.count).toEqual(1);
			const updatedMessages = await prisma.message.findMany({
				where: {
					recipientId: 3,
					senderId: 1,
				},
			});
			expect(updatedMessages.filter((message) => !message.isRead)).toEqual([]);
		});
		test("testuser3 reads all messages from testuser2.", async () => {
			const read = await readMessages(3, 2);
			expect(read.count).toEqual(2);
			const updatedMessages = await prisma.message.findMany({
				where: {
					recipientId: 3,
					senderId: 2,
				},
			});
			expect(updatedMessages.filter((message) => !message.isRead)).toEqual([]);
		});
		test("testuser3 reads all messages from testuser4.", async () => {
			const read = await readMessages(3, 4);
			expect(read.count).toEqual(0);
			const updatedMessages = await prisma.message.findMany({
				where: {
					recipientId: 3,
					senderId: 4,
				},
			});
			expect(updatedMessages.filter((message) => !message.isRead)).toEqual([]);
		});
		test("testuser4 reads all messages from testuser1.", async () => {
			const read = await readMessages(4, 1);
			expect(read.count).toEqual(0);
			const updatedMessages = await prisma.message.findMany({
				where: {
					recipientId: 4,
					senderId: 1,
				},
			});
			expect(updatedMessages.filter((message) => !message.isRead)).toEqual([]);
		});
		test("testuser4 reads all messages from testuser2.", async () => {
			const read = await readMessages(4, 2);
			expect(read.count).toEqual(1);
			const updatedMessages = await prisma.message.findMany({
				where: {
					recipientId: 4,
					senderId: 2,
				},
			});
			expect(updatedMessages.filter((message) => !message.isRead)).toEqual([]);
		});
		test("testuser4 reads all messages from testuser3.", async () => {
			const read = await readMessages(4, 3);
			expect(read.count).toEqual(0);
			const updatedMessages = await prisma.message.findMany({
				where: {
					recipientId: 4,
					senderId: 3,
				},
			});
			expect(updatedMessages.filter((message) => !message.isRead)).toEqual([]);
		});
	});

	describe("Fetch unread messages boolean at route: [GET] /unread.", () => {
		test("Responds with HTTP status 200 and true if there are any unread messages", async () => {
			const { status, body } = (await request(testApp).get("/messages/unread")) as IResponse;
			expect(status).toEqual(200);
			expect(body).toEqual(true);
		});

		test("Reads relevant messages then responds with HTTP status 200 and false.", async () => {
			await readMessages(1, 2);
			await readMessages(1, 3);
			const { status, body } = (await request(testApp).get("/messages/unread")) as IResponse;
			expect(status).toEqual(200);
			expect(body).toEqual(false);
		});
	});

	describe("Fetch messages at route: [GET] /messages.", () => {
		test("Responds with HTTP status 200 and all messages between the session user (testuser1) and the user with ID provided as a parameter.", async () => {
			const request1 = (await request(testApp).get("/messages/testuseruuid2")) as IResponse;
			expect(request1.status).toEqual(200);
			expect(request1.body).length(4);
			expect(request1.body[0]).toMatchObject({
				uuid: "testmessageuuid1",
			});
			expect(request1.body[1]).toMatchObject({
				uuid: "testmessageuuid4",
			});
			expect(request1.body[2]).toMatchObject({
				uuid: "testmessageuuid2",
			});
			expect(request1.body[3]).toMatchObject({
				uuid: "testmessageuuid5",
			});

			const request2 = (await request(testApp).get("/messages/testuseruuid3")) as IResponse;
			expect(request2.status).toEqual(200);
			expect(request2.body).length(4);
			expect(request2.body[0]).toMatchObject({
				uuid: "testmessageuuid8",
			});
			expect(request2.body[1]).toMatchObject({
				uuid: "testmessageuuid3",
			});
			expect(request2.body[2]).toMatchObject({
				uuid: "testmessageuuid9",
			});
			expect(request2.body[3]).toMatchObject({
				uuid: "testmessageuuid10",
			});

			const request3 = (await request(testApp).get("/messages/testuseruuid1")) as IResponse;
			expect(request3.status).toEqual(200);
			expect(request3.body).length(0);

			const request4 = (await request(testApp).get("/messages/testuseruuid4")) as IResponse;
			expect(request4.status).toEqual(200);
			expect(request4.body).length(0);
		});
		test("Responds with HTTP status 404 when a recipient ID is provided with no corresponding user in the database.", async () => {
			const { status, body } = (await request(testApp).get("/messages/testuseruuid5")) as IResponse;
			expect(status).toEqual(404);
			expect(body).toEqual(["Expected a record, found none."]);
		});
	});

	describe("Send a new message at route: [POST] /messages.", () => {
		test("Responds with HTTP status 201 and relevant messages when a new message is sent.", async () => {
			const { status, body } = (await request(testApp)
				.post("/messages/testuseruuid2")
				.send({ text: "New test message from from testuser1 to testuser2" })) as IResponse;
			expect(status).toEqual(201);
			expect(body).length(5);
			expect(body[4]).toMatchObject({
				sender: { uuid: "testuseruuid1" },
				recipient: { uuid: "testuseruuid2" },
				text: "New test message from from testuser1 to testuser2",
			});
		});
		test("Responds with HTTP status 400 if message validation fails - message too short.", async () => {
			const { status, body } = (await request(testApp)
				.post("/messages/testuseruuid2")
				.send({ text: "" })) as IResponse;
			expect(status).toEqual(400);
			expect(body).toEqual(["Message cannot be empty."]);
		});
		test("Responds with HTTP status 400 if message validation fails - text parameter missing.", async () => {
			const { status, body } = (await request(testApp).post("/messages/testuseruuid2")) as IResponse;
			expect(status).toEqual(400);
			expect(body).toEqual(["Message not provided."]);
		});
		test("Responds with HTTP status 404 when a user ID is provided with no corresponding user in the database.", async () => {
			const { status, body } = (await request(testApp).post("/messages/testuseruuid5")) as IResponse;
			expect(status).toEqual(404);
			expect(body).toEqual(["Expected a record, found none."]);
		});
	});

	describe("Update an existing message at route: [PUT] /messages.", () => {
		test("Responds with HTTP status 200 and all relevant messages when an existing message is updated.", async () => {
			const { status, body } = (await request(testApp)
				.put("/messages/testuseruuid2/message/testmessageuuid1")
				.send({ text: "test message from testuser1 to testuser2 - updated" })) as IResponse;
			expect(status).toEqual(200);
			expect(body).length(4);
			const updatedMessage = body
				.filter((message) => isMessage(message))
				.filter((message) => message.uuid === "testmessageuuid1");
			expect(updatedMessage).length(1);
			expect(updatedMessage[0]).toMatchObject({
				sender: { uuid: "testuseruuid1" },
				recipient: { uuid: "testuseruuid2" },
				uuid: "testmessageuuid1",
				text: "test message from testuser1 to testuser2 - updated",
			});
			expect(updatedMessage[0].updatedAt > updatedMessage[0].createdAt).toBe(true);
		});
		test("Responds with HTTP status 200 and all relevant messages when an existing message is update but not changed.", async () => {
			const { status, body } = (await request(testApp)
				.put("/messages/testuseruuid2/message/testmessageuuid1")
				.send({ text: "test message from testuser1 to testuser2" })) as IResponse;
			expect(status).toEqual(200);
			expect(body).length(4);
			const updatedMessage = body
				.filter((message) => isMessage(message))
				.filter((message) => message.uuid === "testmessageuuid1");
			expect(updatedMessage).length(1);
			expect(updatedMessage[0]).toMatchObject({
				sender: { uuid: "testuseruuid1" },
				recipient: { uuid: "testuseruuid2" },
				uuid: "testmessageuuid1",
				text: "test message from testuser1 to testuser2",
			});
			expect(updatedMessage[0].updatedAt).toEqual(updatedMessage[0].createdAt);
		});
		test("Responds with HTTP status 400 if message validation fails - message too short.", async () => {
			const { status, body } = (await request(testApp)
				.put("/messages/testuseruuid2/message/testmessageuuid1")
				.send({ text: "" })) as IResponse;
			expect(status).toEqual(400);
			expect(body).toEqual(["Message cannot be empty."]);
		});
		test("Responds with HTTP status 400 if message validation fails - text parameter missing.", async () => {
			const { status, body } = (await request(testApp)
				.put("/messages/testuseruuid2/message/testmessageuuid1")
				.send({})) as IResponse;
			expect(status).toEqual(400);
			expect(body).toEqual(["Message not provided."]);
		});
		test("Responds with HTTP status 404 if the recipient ID provided does not correspond to a user in the database.", async () => {
			const { status, body } = (await request(testApp)
				.put("/messages/testuseruuid5/message/testmessageuuid1")
				.send({ text: "update nonexistent recipient" })) as IResponse;
			expect(status).toEqual(404);
			expect(body).toEqual(["Expected a record, found none."]);
		});
		test("Responds with HTTP status 404 if the message ID provided does not correspond to a message in the database.", async () => {
			const { status, body } = (await request(testApp)
				.put("/messages/testuseruuid2/message/testmessageuuid16")
				.send({ text: "update nonexistant message" })) as IResponse;
			expect(status).toEqual(404);
			expect(body).toEqual(["Expected a record, found none."]);
		});
		test("Responds with HTTP status 403 if message's sender ID does not match the session's userID (trying to update someone else's message).", async () => {
			const { status, body } = (await request(testApp)
				.put("/messages/testuseruuid2/message/testmessageuuid4")
				.send({ text: "update someone else's message" })) as IResponse;
			expect(status).toEqual(403);
			expect(body).toEqual(["Cannot update someone else's message."]);
		});
	});

	describe("deletes an existing message at route: [DELETE] /messages.", () => {
		test("Responds with HTTP status 200 and all relevant messages when a message is deleted.", async () => {
			const { status, body } = (await request(testApp).delete(
				"/messages/testuseruuid2/message/testmessageuuid1"
			)) as IResponse;
			expect(status).toEqual(200);
			expect(body).length(3);
			expect(body.filter((message) => isMessage(message)).map((message) => message.uuid)).not.toContain(
				"testmessageuuid1"
			);
		});
		test("Responds with HTTP status 404 if the recipient ID provided does not correspond to a user in the database.", async () => {
			const { status, body } = (await request(testApp).delete(
				"/messages/testuseruuid5/message/testmessageuuid1"
			)) as IResponse;
			expect(status).toEqual(404);
			expect(body).toEqual(["Expected a record, found none."]);
		});
		test("Responds with HTTP status 404 if the message ID provided does not correspond to a message in the database.", async () => {
			const { status, body } = (await request(testApp).delete(
				"/messages/testuseruuid2/message/testmessageuuid16"
			)) as IResponse;
			expect(status).toEqual(404);
			expect(body).toEqual(["Expected a record, found none."]);
		});
		test("Responds with HTTP status 403 if message's sender ID does not match the session's userID (trying to delete someone else's message).", async () => {
			const { status, body } = (await request(testApp).delete(
				"/messages/testuseruuid2/message/testmessageuuid4"
			)) as IResponse;
			expect(status).toEqual(403);
			expect(body).toEqual(["Cannot delete someone else's message."]);
		});
	});
});
