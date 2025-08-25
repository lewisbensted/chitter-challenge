import express, { NextFunction } from "express";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { resetDB } from "../../../prisma/resetDB";
import { testUser1, testUser2 } from "../fixtures/users.fixtures";
import prisma from "../../../prisma/prismaClient";
import { testCheets } from "../fixtures/cheets.fixtures";
import { testReplies } from "../fixtures/replies.fixtures";
import replies, { fetchReplies } from "../../routes/replies";
import session from "express-session";
import request from "supertest";
import { IReply } from "../../../types/responses";

interface IResponse {
	status: number;
	body: IReply[] | string[];
}

function isReply(body: IReply | string): body is IReply {
	return (body as IReply).uuid ? true : false;
}

describe("Test replies routes.", () => {
	vi.mock("./../../middleware/authMiddleware", () => ({
		authMiddleware: vi.fn((_req, _res, next: NextFunction) => {
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
	testApp.use(session({ secret: "secret-key", saveUninitialized: false, resave: false }));
	testApp.all("*", (req, _res, next) => {
		req.session.user = { id: 1, uuid: "testuseruuid1" };
		next();
	});
	testApp.use("/cheets/:cheetId/replies", express.json(), replies);

	describe("Test fetchReplies function which fetches relevant replies from the database and sorts them in chronological order.", () => {
		test("Test different cheet IDs.", async () => {
			const replies1 = await fetchReplies(1);
			expect(replies1).length(1);
			expect(replies1[0]).toMatchObject({
				user: { uuid: "testuseruuid1" },
				cheet: { uuid: "testcheetuuid1" },
				uuid: "testreplyuuid1",
				text: "test reply 1",
			});

			const replies2 = await fetchReplies(2);
			expect(replies2).length(4);
			expect(replies2[0]).toMatchObject({
				user: { uuid: "testuseruuid1" },
				cheet: { uuid: "testcheetuuid2" },
				uuid: "testreplyuuid3",
				text: "test reply 3",
			});

			expect(replies2[1]).toMatchObject({
				user: { uuid: "testuseruuid1" },
				cheet: { uuid: "testcheetuuid2" },
				uuid: "testreplyuuid4",
				text: "test reply 4",
			});

			expect(replies2[2]).toMatchObject({
				user: { uuid: "testuseruuid2" },
				cheet: { uuid: "testcheetuuid2" },
				uuid: "testreplyuuid6",
				text: "test reply 6",
			});

			expect(replies2[3]).toMatchObject({
				user: { uuid: "testuseruuid2" },
				cheet: { uuid: "testcheetuuid2" },
				uuid: "testreplyuuid8",
				text: "test reply 8",
			});

			const replies3 = await fetchReplies(3);
			expect(replies3).length(3);

			expect(replies3[0]).toMatchObject({
				user: { uuid: "testuseruuid2" },
				cheet: { uuid: "testcheetuuid3" },
				uuid: "testreplyuuid5",
				text: "test reply 5",
			});
			expect(replies3[1]).toMatchObject({
				user: { uuid: "testuseruuid2" },
				cheet: { uuid: "testcheetuuid3" },
				uuid: "testreplyuuid7",
				text: "test reply 7",
			});
			expect(replies3[2]).toMatchObject({
				user: { uuid: "testuseruuid2" },
				cheet: { uuid: "testcheetuuid3" },
				uuid: "testreplyuuid9",
				text: "test reply 9",
			});

			const replies4 = await fetchReplies(4);
			expect(replies4).length(0);

			const replies5 = await fetchReplies(5);
			expect(replies5).length(2);
			expect(replies5[0]).toMatchObject({
				user: { uuid: "testuseruuid1" },
				cheet: { uuid: "testcheetuuid5" },
				uuid: "testreplyuuid2",
				text: "test reply 2",
			});
			expect(replies5[1]).toMatchObject({
				user: { uuid: "testuseruuid2" },
				cheet: { uuid: "testcheetuuid5" },
				uuid: "testreplyuuid10",
				text: "test reply 10",
			});
		});

		describe("Fetch replies at route: [GET] /replies.", () => {
			test("Responds with HTTP status 200 and all replies relevant to the cheet specified in the request params.", async () => {
				const request1 = (await request(testApp).get("/cheets/testcheetuuid1/replies")) as IResponse;
				expect(request1.status).toEqual(200);
				expect(request1.body).length(1);
				expect(request1.body[0]).toMatchObject({ uuid: "testreplyuuid1" });

				const request2 = (await request(testApp).get("/cheets/testcheetuuid2/replies")) as IResponse;
				expect(request2.status).toEqual(200);
				expect(request2.body).length(4);
				expect(request2.body[0]).toMatchObject({ uuid: "testreplyuuid3" });
				expect(request2.body[1]).toMatchObject({ uuid: "testreplyuuid4" });
				expect(request2.body[2]).toMatchObject({ uuid: "testreplyuuid6" });
				expect(request2.body[3]).toMatchObject({ uuid: "testreplyuuid8" });

				const request3 = (await request(testApp).get("/cheets/testcheetuuid3/replies")) as IResponse;
				expect(request3.status).toEqual(200);
				expect(request3.body).length(3);
				expect(request3.body[0]).toMatchObject({ uuid: "testreplyuuid5" });
				expect(request3.body[1]).toMatchObject({ uuid: "testreplyuuid7" });
				expect(request3.body[2]).toMatchObject({ uuid: "testreplyuuid9" });

				const request4 = (await request(testApp).get("/cheets/testcheetuuid4/replies")) as IResponse;
				expect(request4.status).toEqual(200);
				expect(request4.body).length(0);

				const request5 = (await request(testApp).get("/cheets/testcheetuuid5/replies")) as IResponse;
				expect(request5.status).toEqual(200);
				expect(request5.body).length(2);
				expect(request5.body[0]).toMatchObject({ uuid: "testreplyuuid2" });
				expect(request5.body[1]).toMatchObject({ uuid: "testreplyuuid10" });
			});
			test("Responds with HTTP status 404 if reply's target cheet does not exist in the database.", async () => {
				const { status, body } = (await request(testApp).get("/cheets/testcheetuuid6/replies")) as IResponse;
				expect(status).toEqual(404);
				expect(body).toEqual(["Expected a record, found none."]);
			});
		});
		describe("Post a new reply at route: [POST] /replies.", () => {
			test("Responds with HTTP status 201 and all relevant replies when a new reply is created.", async () => {
				const { status, body } = (await request(testApp)
					.post("/cheets/testcheetuuid1/replies")
					.send({ text: "new test reply" })) as IResponse;
				expect(status).toEqual(201);
				expect(body).length(2);
				expect(body[1]).toMatchObject({
					user: { uuid: "testuseruuid1" },
					cheet: { uuid: "testcheetuuid1" },
					text: "new test reply",
				});
			});
			test("Responds with HTTP status 400 if reply validation fails - text too short.", async () => {
				const { status, body } = (await request(testApp)
					.post("/cheets/testcheetuuid1/replies")
					.send({ text: "test" })) as IResponse;
				expect(status).toEqual(400);
				expect(body).toEqual(["Reply too short - must be between 5 and 50 characters."]);
			});
			test("Responds with HTTP status 400 if reply validation fails - no text field.", async () => {
				const { status, body } = (await request(testApp).post("/cheets/testcheetuuid1/replies")) as IResponse;
				expect(status).toEqual(400);
				expect(body).toEqual(["Text not provided."]);
			});
			test("Responds with HTTP status 404 if reply's target cheet does not exist in the database.", async () => {
				const { status, body } = (await request(testApp)
					.post("/cheets/testcheetuuid6/replies")
					.send({ text: "new test reply" })) as IResponse;
				expect(status).toEqual(404);
				expect(body).toEqual(["Expected a record, found none."]);
			});
		});

		describe("Updates an existing reply at route: [PUT] /replies.", () => {
			test("Responds with HTTP status 200 and all relevant replies when a reply is updated.", async () => {
				const { status, body } = (await request(testApp)
					.put("/cheets/testcheetuuid1/replies/testreplyuuid1")
					.send({ text: "test reply 1 - updated" })) as IResponse;
				expect(status).toEqual(200);
				expect(body).length(1);
				expect(body[0]).toMatchObject({
					user: { uuid: "testuseruuid1" },
					cheet: { uuid: "testcheetuuid1" },
					uuid: "testreplyuuid1",
					text: "test reply 1 - updated",
				});
			});
			test("Responds with HTTP status 200 and all relevant replies when a reply is updated but not changed.", async () => {
				const { status, body } = (await request(testApp)
					.put("/cheets/testcheetuuid1/replies/testreplyuuid1")
					.send({ text: "test reply 1" })) as IResponse;
				expect(status).toEqual(200);
				expect(body).length(1);
				expect(body[0]).toMatchObject({
					user: { uuid: "testuseruuid1" },
					cheet: { uuid: "testcheetuuid1" },
					uuid: "testreplyuuid1",
					text: "test reply 1",
				});
			});
			test("Responds with HTTP status 400 if reply validation fails - text too short.", async () => {
				const { status, body } = (await request(testApp)
					.put("/cheets/testcheetuuid1/replies/testreplyuuid1")
					.send({ text: "test" })) as IResponse;
				expect(status).toEqual(400);
				expect(body).toEqual(["Reply too short - must be between 5 and 50 characters."]);
			});
			test("Responds with HTTP status 400 if reply validation fails - text parameter missing.", async () => {
				const { status, body } = (await request(testApp).put(
					"/cheets/testcheetuuid1/replies/testreplyuuid1"
				)) as IResponse;
				expect(status).toEqual(400);
				expect(body).toEqual(["Text not provided."]);
			});
			test("Responds with HTTP status 403 if reply's userID does not match the session's userID (trying to update someone else's cheet).", async () => {
				const { status, body } = (await request(testApp)
					.put("/cheets/testcheetuuid2/replies/testreplyuuid6")
					.send({ text: "test reply 2 - updated" })) as IResponse;
				expect(status).toEqual(403);
				expect(body).toEqual(["Cannot update someone else's reply."]);
			});
			test("Responds with HTTP status 404 if the reply to be updated does not exist in the database.", async () => {
				const { status, body } = (await request(testApp)
					.put("/cheets/testcheetuuid1/replies/testreplyuuid11")
					.send({ text: "test reply 1 - updated" })) as IResponse;
				expect(status).toEqual(404);
				expect(body).toEqual(["Expected a record, found none."]);
			});
			test("Responds with HTTP status 404 if reply's target cheet does not exist in the database.", async () => {
				const { status, body } = (await request(testApp)
					.put("/cheets/testcheetuuid6/replies/testreplyuuid1")
					.send({ text: "test reply 1 - updated" })) as IResponse;
				expect(status).toEqual(404);
				expect(body).toEqual(["Expected a record, found none."]);
			});
			test("Responds with HTTP status 404 if reply's cheet ID does not match the cheet ID provided.", async () => {
				const { status, body } = (await request(testApp).put(
					"/cheets/testcheetuuid2/replies/testreplyuuid1"
				)) as IResponse;
				expect(status).toEqual(403);
				expect(body).toEqual(["Cheet IDs do not match."]);
			});
		});

		describe("Deletes an existing reply at route: [DELETE] /replies.", () => {
			test("Responds with HTTP status 200 and all relevant replies when a reply is deleted.", async () => {
				const { status, body } = (await request(testApp).delete(
					"/cheets/testcheetuuid2/replies/testreplyuuid4"
				)) as IResponse;
				expect(status).toEqual(200);
				const replies = body.filter((reply) => isReply(reply)).map((reply) => reply.uuid);
				expect(replies).length(3);
				expect(replies).not.toContain("testreplyuuid4");
			});
			test("Responds with HTTP status 403 if reply's userID does not match the session's userID (trying to update someone else's reply).", async () => {
				const { status, body } = (await request(testApp).delete(
					"/cheets/testcheetuuid2/replies/testreplyuuid6"
				)) as IResponse;
				expect(status).toEqual(403);
				expect(body).toEqual(["Cannot delete someone else's reply."]);
			});
			test("Responds with HTTP status 404 if the reply to be updated does not exist in the database.", async () => {
				const { status, body } = (await request(testApp).delete(
					"/cheets/testcheetuuid1/replies/testreplyuuid11"
				)) as IResponse;
				expect(status).toEqual(404);
				expect(body).toEqual(["Expected a record, found none."]);
			});
			test("Responds with HTTP status 404 if reply's target cheet does not exist in the database.", async () => {
				const { status, body } = (await request(testApp).delete(
					"/cheets/testcheetuuid6/replies/testreplyuuid1"
				)) as IResponse;
				expect(status).toEqual(404);
				expect(body).toEqual(["Expected a record, found none."]);
			});
			test("Responds with HTTP status 404 if reply's cheet ID does not match the cheet ID provided.", async () => {
				const { status, body } = (await request(testApp).delete(
					"/cheets/testcheetuuid2/replies/testreplyuuid1"
				)) as IResponse;
				expect(status).toEqual(403);
				expect(body).toEqual(["Cheet IDs do not match."]);
			});
		});
	});
});
