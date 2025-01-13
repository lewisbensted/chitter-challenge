import express from "express";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { resetDB } from "../resetDB";
import { testUser1, testUser2 } from "../fixtures/users.fixtures";
import prisma from "../../../prisma/prismaClient";
import { testCheets } from "../fixtures/cheets.fixtures";
import { testReplies } from "../fixtures/replies.fixtures";
import replies, { fetchReplies } from "../../routes/replies";
import session from "express-session";
import request from "supertest";
import { Reply } from "@prisma/client";

describe("Test replies routes.", () => {
	vi.mock("./../../middleware/authMiddleware", () => ({
		authMiddleware: vi.fn((req, _res, next) => {
			next();
		}),
	}));

	beforeEach(async () => {
		await resetDB();
		await prisma.user.create({ data: testUser1 });
		await prisma.user.create({ data: testUser2 });
		await prisma.cheet.createMany({ data: testCheets });
		await prisma.reply.createMany({ data: testReplies });
	});

	const testApp = express();
	testApp.use(session({ secret: "secret-key" }));
	testApp.all("*", (req, res, next) => {
		req.session.user = { id: 1, uuid: "testuseruuid1" };
		next();
	});
	testApp.use("/cheets/:cheetId/replies", express.json(), replies);

	describe("Test fetchReplies function which fetches relevant replies from the database and sorts them in chronological order.", async () => {
		test("Test different cheet IDs.", async () => {
			const replies1 = await fetchReplies(1);
			expect(replies1).length(1);
			expect([replies1[0].user.username, replies1[0].text, replies1[0].cheet.uuid]).toEqual([
				"testuser1",
				"test reply 1",
				"testcheetuuid1",
			]);

			const replies2 = await fetchReplies(2);
			expect(replies2).length(4);
			expect([replies2[0].user.username, replies2[0].text, replies2[0].cheet.uuid]).toEqual([
				"testuser1",
				"test reply 3",
				"testcheetuuid2",
			]);
			expect([replies2[1].user.username, replies2[1].text, replies2[1].cheet.uuid]).toEqual([
				"testuser1",
				"test reply 4",
				"testcheetuuid2",
			]);
			expect([replies2[2].user.username, replies2[2].text, replies2[2].cheet.uuid]).toEqual([
				"testuser2",
				"test reply 6",
				"testcheetuuid2",
			]);
			expect([replies2[3].user.username, replies2[3].text, replies2[3].cheet.uuid]).toEqual([
				"testuser2",
				"test reply 8",
				"testcheetuuid2",
			]);

			const replies3 = await fetchReplies(3);
			expect(replies3).length(3);
			expect([replies3[0].user.username, replies3[0].text, replies3[0].cheet.uuid]).toEqual([
				"testuser2",
				"test reply 5",
				"testcheetuuid3",
			]);
			expect([replies3[1].user.username, replies3[1].text, replies3[1].cheet.uuid]).toEqual([
				"testuser2",
				"test reply 7",
				"testcheetuuid3",
			]);
			expect([replies3[2].user.username, replies3[2].text, replies3[2].cheet.uuid]).toEqual([
				"testuser2",
				"test reply 9",
				"testcheetuuid3",
			]);

			const replies4 = await fetchReplies(4);
			expect(replies4).length(0);

			const replies5 = await fetchReplies(5);
			expect(replies5).length(2);
			expect([replies5[0].user.username, replies5[0].text, replies5[0].cheet.uuid]).toEqual([
				"testuser1",
				"test reply 2",
				"testcheetuuid5",
			]);
			expect([replies5[1].user.username, replies5[1].text, replies5[1].cheet.uuid]).toEqual([
				"testuser2",
				"test reply 10",
				"testcheetuuid5",
			]);
		});

		describe("Fetch replies at route: [GET] /replies.", async () => {
			test("Responds with HTTP status 200 and all replies relevant to the cheet specified in the request params.", async () => {
				const request1 = await request(testApp).get("/cheets/testcheetuuid1/replies");
				expect(request1.status).toEqual(200);
				expect(request1.body).length(1);

				const request2 = await request(testApp).get("/cheets/testcheetuuid2/replies");
				expect(request2.status).toEqual(200);
				expect(request2.body).length(4);

				const request3 = await request(testApp).get("/cheets/testcheetuuid3/replies");
				expect(request3.status).toEqual(200);
				expect(request3.body).length(3);

				const request4 = await request(testApp).get("/cheets/testcheetuuid4/replies");
				expect(request4.status).toEqual(200);
				expect(request4.body).length(0);

				const request5 = await request(testApp).get("/cheets/testcheetuuid5/replies");
				expect(request5.status).toEqual(200);
				expect(request5.body).length(2);
			});
			test("Responds with HTTP status 404 if reply's target cheet does not exist in the database.", async () => {
				const { status, body } = await request(testApp).get("/cheets/testcheetuuid6/replies");
				expect(status).toEqual(404);
				expect(body).toEqual(["No Cheet found with ID provided."]);
			});
		});
		describe("Post a new reply at route: [POST] /replies.", async () => {
			test("Responds with HTTP status 201 and all relevant replies when a new reply is created.", async () => {
				const { status, body } = await request(testApp)
					.post("/cheets/testcheetuuid1/replies")
					.send({ text: "new test reply" });
				expect(status).toEqual(201);
				expect(body).length(2);
				expect([body[1].user.username, body[1].text]).toEqual(["testuser1", "new test reply"]);
			});
			test("Responds with HTTP status 400 if reply validation fails - text too short.", async () => {
				const { status, body } = await request(testApp)
					.post("/cheets/testcheetuuid1/replies")
					.send({ text: "test" });
				expect(status).toEqual(400);
				expect(body).toEqual(["Reply too short - must be between 5 and 50 characters."]);
			});
			test("Responds with HTTP status 400 if reply validation fails - no text field.", async () => {
				const { status, body } = await request(testApp).post("/cheets/testcheetuuid1/replies");
				expect(status).toEqual(400);
				expect(body).toEqual(["Text not provided."]);
			});
			test("Responds with HTTP status 404 if reply's target cheet does not exist in the database.", async () => {
				const { status, body } = await request(testApp)
					.post("/cheets/testcheetuuid6/replies")
					.send({ text: "new test reply" });
				expect(status).toEqual(404);
				expect(body).toEqual(["No Cheet found with ID provided."]);
			});
		});

		describe("Updates an existing reply at route: [PUT] /replies.", async () => {
			test("Responds with HTTP status 200 and all relevant replies when a reply is updated.", async () => {
				const { status, body } = await request(testApp)
					.put("/cheets/testcheetuuid1/replies/testreplyuuid1")
					.send({ text: "test reply 1 - updated" });
				expect(status).toEqual(200);
				expect(body).length(1);
				expect([body[0].user.username, body[0].text]).toEqual(["testuser1", "test reply 1 - updated"]);
			});
			test("Responds with HTTP status 400 if reply validation fails - text too short.", async () => {
				const { status, body } = await request(testApp)
					.put("/cheets/testcheetuuid1/replies/testreplyuuid1")
					.send({ text: "test" });
				expect(status).toEqual(400);
				expect(body).toEqual(["Reply too short - must be between 5 and 50 characters."]);
			});
			test("Responds with HTTP status 400 if reply validation fails - text parameter missing.", async () => {
				const { status, body } = await request(testApp).put("/cheets/testcheetuuid1/replies/testreplyuuid1");
				expect(status).toEqual(400);
				expect(body).toEqual(["Text not provided."]);
			});
			test("Responds with HTTP status 403 if reply's userID does not match the session's userID (trying to update someone else's cheet).", async () => {
				const { status, body } = await request(testApp)
					.put("/cheets/testcheetuuid2/replies/testreplyuuid6")
					.send({ text: "test reply 2 - updated" });
				expect(status).toEqual(403);
				expect(body).toEqual(["Cannot update someone else's reply."]);
			});
			test("Responds with HTTP status 404 if the reply to be updated does not exist in the database.", async () => {
				const { status, body } = await request(testApp)
					.put("/cheets/testcheetuuid1/replies/testreplyuuid11")
					.send({ text: "test reply 1 - updated" });
				expect(status).toEqual(404);
				expect(body).toEqual(["No Reply found with ID provided."]);
			});
			test("Responds with HTTP status 404 if reply's target cheet does not exist in the database.", async () => {
				const { status, body } = await request(testApp)
					.put("/cheets/testcheetuuid6/replies/testreplyuuid1")
					.send({ text: "test reply 1 - updated" });
				expect(status).toEqual(404);
				expect(body).toEqual(["No Cheet found with ID provided."]);
			});
			test("Responds with HTTP status 404 if reply's cheet ID does not match the cheet ID provided.", async () => {
				const { status, body } = await request(testApp).put("/cheets/testcheetuuid2/replies/testreplyuuid1");
				expect(status).toEqual(403);
				expect(body).toEqual(["Cheet IDs do not match."]);
			});
		});

		describe("Deletes an existing reply at route: [DELETE] /replies.", async () => {
			test("Responds with HTTP status 200 and all relevant replies when a reply is deleted.", async () => {
				const { status, body } = await request(testApp).delete("/cheets/testcheetuuid2/replies/testreplyuuid4");
				expect(status).toEqual(200);
				expect(body).length(3);
				expect(body.map((reply: Reply) => reply.id)).not.toContain(4);
			});
			test("Responds with HTTP status 403 if reply's userID does not match the session's userID (trying to update someone else's reply).", async () => {
				const { status, body } = await request(testApp).delete("/cheets/testcheetuuid2/replies/testreplyuuid6");
				expect(status).toEqual(403);
				expect(body).toEqual(["Cannot delete someone else's reply."]);
			});
			test("Responds with HTTP status 404 if the reply to be updated does not exist in the database.", async () => {
				const { status, body } = await request(testApp).delete(
					"/cheets/testcheetuuid1/replies/testreplyuuid11"
				);
				expect(status).toEqual(404);
				expect(body).toEqual(["No Reply found with ID provided."]);
			});
			test("Responds with HTTP status 404 if reply's target cheet does not exist in the database.", async () => {
				const { status, body } = await request(testApp).delete("/cheets/testcheetuuid6/replies/testreplyuuid1");
				expect(status).toEqual(404);
				expect(body).toEqual(["No Cheet found with ID provided."]);
			});
			test("Responds with HTTP status 404 if reply's cheet ID does not match the cheet ID provided.", async () => {
				const { status, body } = await request(testApp).delete("/cheets/testcheetuuid2/replies/testreplyuuid1");
				expect(status).toEqual(403);
				expect(body).toEqual(["Cheet IDs do not match."]);
			});
		});
	});
});
