import { beforeEach, test, describe, vi, expect } from "vitest";
import prisma from "../../../prisma/prismaClient";
import { resetDB } from "../../../prisma/resetDB";
import { testUser1, testUser2 } from "../fixtures/users.fixtures";
import cheets, { fetchCheets } from "../../routes/cheets";
import { testCheets } from "../fixtures/cheets.fixtures";
import express, { NextFunction } from "express";
import request from "supertest";
import session from "express-session";
import { ICheet } from "../../../types/responses";

interface IResponse {
	status: number;
	body: ICheet[] | string[];
}

function isCheet(body: ICheet | string): body is ICheet {
	return (body as ICheet).uuid ? true : false;
}

describe("Test cheets routes.", () => {
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
	});

	const testApp = express();
	testApp.use(session({ secret: "secret-key", saveUninitialized: false, resave: false }));
	testApp.all("*", (req, _res, next) => {
		req.session.user = { id: 1, uuid: "testuseruuid1" };
		next();
	});
	testApp.use("/cheets", express.json(), cheets);
	testApp.use("/users/:userId/cheets", express.json(), cheets);

	describe("Test fetchCheets function which fetches relevant cheets from the database and sorts them in chronological order.", () => {
		test("No user ID provided as a parameter.", async () => {
			const cheets = await fetchCheets();
			expect(cheets).length(5);
			expect(cheets[0]).toMatchObject({
				user: { uuid: "testuseruuid1" },
				uuid: "testcheetuuid3",
				text: "test cheet 3",
			});
			expect(cheets[1]).toMatchObject({
				user: { uuid: "testuseruuid1" },
				uuid: "testcheetuuid4",
				text: "test cheet 4",
			});
			expect(cheets[2]).toMatchObject({
				user: { uuid: "testuseruuid2" },
				uuid: "testcheetuuid2",
				text: "test cheet 2",
			});
			expect(cheets[3]).toMatchObject({
				user: { uuid: "testuseruuid2" },
				uuid: "testcheetuuid5",
				text: "test cheet 5",
			});
			expect(cheets[4]).toMatchObject({
				user: { uuid: "testuseruuid1" },
				uuid: "testcheetuuid1",
				text: "test cheet 1",
			});
		});
		test("User ID provided as a parameter.", async () => {
			const cheets = await fetchCheets(1);
			expect(cheets).length(3);
			expect(cheets[0]).toMatchObject({
				user: { uuid: "testuseruuid1" },
				uuid: "testcheetuuid3",
				text: "test cheet 3",
			});
			expect(cheets[1]).toMatchObject({
				user: { uuid: "testuseruuid1" },
				uuid: "testcheetuuid4",
				text: "test cheet 4",
			});
			expect(cheets[2]).toMatchObject({
				user: { uuid: "testuseruuid1" },
				uuid: "testcheetuuid1",
				text: "test cheet 1",
			});
		});
	});

	describe("Fetch cheets at route: [GET] /cheets.", () => {
		test("Responds with HTTP status 200 and all cheets when a user ID is not provided as a parameter.", async () => {
			const { status, body } = (await request(testApp).get("/cheets")) as IResponse;
			expect(status).toEqual(200);
			expect(body).length(5);
		});
		test("Responds with HTTP status 200 and cheets relevant to a particular user when a user ID is provided as a parameter.", async () => {
			const request1 = (await request(testApp).get("/users/testuseruuid1/cheets")) as IResponse;
			expect(request1.status).toEqual(200);
			expect(request1.body).length(3);
			expect(request1.body[0]).toMatchObject({ uuid: "testcheetuuid3" });
			expect(request1.body[1]).toMatchObject({ uuid: "testcheetuuid4" });
			expect(request1.body[2]).toMatchObject({ uuid: "testcheetuuid1" });

			const request2 = (await request(testApp).get("/users/testuseruuid2/cheets")) as IResponse;
			expect(request2.status).toEqual(200);
			expect(request2.body).length(2);
			expect(request2.body[0]).toMatchObject({ uuid: "testcheetuuid2" });
			expect(request2.body[1]).toMatchObject({ uuid: "testcheetuuid5" });
		});
		test("Responds with HTTP status 404 when a user ID is provided with no corresponding user in the database.", async () => {
			const { status, body } = (await request(testApp).get("/users/testuseruuid3/cheets")) as IResponse;
			expect(status).toEqual(404);
			expect(body).toEqual(["Expected a record, found none."]);
		});
	});

	describe("Post a new cheet at route: [POST] /cheets.", () => {
		test("Responds with HTTP status 201 and all cheets when a new cheet is created without a user ID parameter.", async () => {
			const { status, body } = (await request(testApp)
				.post("/cheets")
				.send({ text: "new test cheet" })) as IResponse;
			expect(status).toEqual(201);
			expect(body).length(6);
			expect(body[5]).toMatchObject({ text: "new test cheet", user: { uuid: "testuseruuid1" } });
		});
		test("Responds with HTTP status 201 and relevant cheets when a new cheet is created with a user ID parameter.", async () => {
			const request1 = (await request(testApp)
				.post("/users/testuseruuid1/cheets")
				.send({ text: "new test cheet 2" })) as IResponse;
			expect(request1.status).toEqual(201);
			expect(request1.body).length(4);
			expect(request1.body[3]).toMatchObject({ text: "new test cheet 2", user: { uuid: "testuseruuid1" } });

			const request2 = (await request(testApp)
				.post("/users/testuseruuid2/cheets")
				.send({ text: "new test cheet 3" })) as IResponse;
			expect(request2.status).toEqual(201);
			expect(request2.body).length(2);
			expect(
				request2.body.filter((cheet) => isCheet(cheet)).map((cheet: { text: string }) => cheet.text)
			).not.toContain("new test cheet 3");
		});
		test("Responds with HTTP status 400 if cheet validation fails - cheet too short.", async () => {
			const { status, body } = (await request(testApp).post("/cheets").send({ text: "test" })) as IResponse;
			expect(status).toEqual(400);
			expect(body).toEqual(["Cheet too short - must be between 5 and 50 characters."]);
		});
		test("Responds with HTTP status 400 if cheet validation fails - text parameter missing.", async () => {
			const { status, body } = (await request(testApp).post("/cheets")) as IResponse;
			expect(status).toEqual(400);
			expect(body).toEqual(["Text not provided."]);
		});
		test("Responds with HTTP status 404 when a user ID is provided with no corresponding user in the database.", async () => {
			const { status, body } = (await request(testApp).post("/users/testuseruuid3/cheets")) as IResponse;
			expect(status).toEqual(404);
			expect(body).toEqual(["Expected a record, found none."]);
		});
	});

	describe("Update an existing cheet at route: [PUT] /cheets.", () => {
		test("Responds with HTTP status 200 and all cheets when an existing cheet is updated without a user ID parameter.", async () => {
			const { status, body } = (await request(testApp)
				.put("/cheets/testcheetuuid1")
				.send({ text: "test cheet 1 - updated" })) as IResponse;
			expect(status).toEqual(200);
			expect(body).length(5);
			const updatedCheet = body
				.filter((cheet) => isCheet(cheet))
				.filter((cheet) => cheet.uuid === "testcheetuuid1");
			expect(updatedCheet).length(1);
			expect(updatedCheet[0]).toMatchObject({
				text: "test cheet 1 - updated",
				uuid: "testcheetuuid1",
				user: { uuid: "testuseruuid1" },
			});
			expect(updatedCheet[0].updatedAt > updatedCheet[0].createdAt);
		});
		test("Responds with HTTP status 200 and all cheets when an existing cheet is updated but not changed.", async () => {
			const { status, body } = (await request(testApp)
				.put("/cheets/testcheetuuid1")
				.send({ text: "test cheet 1" })) as IResponse;
			expect(status).toEqual(200);
			expect(body).length(5);
			const updatedCheet = body
				.filter((cheet) => isCheet(cheet))
				.filter((cheet) => cheet.uuid === "testcheetuuid1");
			expect(updatedCheet).length(1);
			expect(updatedCheet[0]).toMatchObject({
				text: "test cheet 1",
				uuid: "testcheetuuid1",
				user: { uuid: "testuseruuid1" },
			});
			expect(updatedCheet[0].updatedAt > updatedCheet[0].createdAt);
		});
		test("Responds with HTTP status 200 and relevant cheets when an existing cheet is updated with a user ID parameter.", async () => {
			const request1 = (await request(testApp)
				.put("/users/testuseruuid1/cheets/testcheetuuid1")
				.send({ text: "test cheet 1 - updated second" })) as IResponse;
			expect(request1.status).toEqual(200);
			expect(request1.body).length(3);
			const updatedCheet1 = request1.body
				.filter((cheet) => isCheet(cheet))
				.filter((cheet) => cheet.uuid === "testcheetuuid1");
			expect(updatedCheet1).length(1);
			expect(updatedCheet1[0]).toMatchObject({
				text: "test cheet 1 - updated second",
				uuid: "testcheetuuid1",
				user: { uuid: "testuseruuid1" },
			});

			const request2 = (await request(testApp)
				.put("/users/testuseruuid2/cheets/testcheetuuid1")
				.send({ text: "test cheet 1 - updated third" })) as IResponse;
			expect(request2.status).toEqual(200);
			expect(request2.body).length(2);
			const updatedCheet2 = request2.body
				.filter((cheet) => isCheet(cheet))
				.filter((cheet) => cheet.uuid === "testcheetuuid1");
			expect(updatedCheet2).length(0);
		});
		test("Responds with HTTP status 400 if cheet validation fails - cheet too short.", async () => {
			const { status, body } = (await request(testApp)
				.put("/cheets/testcheetuuid1")
				.send({ text: "test" })) as IResponse;
			expect(status).toEqual(400);
			expect(body).toEqual(["Cheet too short - must be between 5 and 50 characters."]);
		});
		test("Responds with HTTP status 400 if cheet validation fails - text parameter missing.", async () => {
			const { status, body } = (await request(testApp).put("/cheets/testcheetuuid1")) as IResponse;
			expect(status).toEqual(400);
			expect(body).toEqual(["Text not provided."]);
		});
		test("Responds with HTTP status 403 if cheet's userID does not match the session's userID (trying to update someone else's cheet).", async () => {
			const { status, body } = (await request(testApp)
				.put("/cheets/testcheetuuid2")
				.send({ text: "testuser2: test cheet 1 - updated" })) as IResponse;
			expect(status).toEqual(403);
			expect(body).toEqual(["Cannot update someone else's cheet."]);
		});
		test("Responds with HTTP status 404 if the user ID provided does not correspond to a user in the database.", async () => {
			const { status, body } = (await request(testApp)
				.put("/users/testuseruuid3/cheets/testcheetuuid1")
				.send({ text: "update cheet nonexistent user" })) as IResponse;
			expect(status).toEqual(404);
			expect(body).toEqual(["Expected a record, found none."]);
		});
		test("Responds with HTTP status 404 if the cheet to be updated does not exist in the database.", async () => {
			const { status, body } = (await request(testApp)
				.put("/cheets/testcheetuuid6")
				.send({ text: "update nonexistent cheet" })) as IResponse;
			expect(status).toEqual(404);
			expect(body).toEqual(["Expected a record, found none."]);
		});
	});

	describe("Delete an existing cheet at route: [DELETE] /cheets.", () => {
		test("Responds with HTTP status 200 and all cheets when an existing cheet is deleted without a user ID parameter.", async () => {
			const { status, body } = (await request(testApp).delete("/cheets/testcheetuuid1")) as IResponse;
			expect(status).toEqual(200);
			expect(body).length(4);
			expect(body.filter((cheet) => isCheet(cheet)).map((cheet) => cheet.uuid)).not.toContain("testcheetuuid1");
		});
		test("Responds with HTTP status 200 and relevant cheets when an existing cheet is deleted with a user ID parameter.", async () => {
			const request1 = (await request(testApp).delete("/users/testuseruuid1/cheets/testcheetuuid1")) as IResponse;
			expect(request1.status).toEqual(200);
			expect(request1.body).length(2);
			const deletedCheet1 = request1.body
				.filter((cheet) => isCheet(cheet))
				.filter((cheet) => cheet.uuid === "testcheetuuid1");
			expect(deletedCheet1).length(0);

			const request2 = (await request(testApp).delete("/users/testuseruuid2/cheets/testcheetuuid3")) as IResponse;
			expect(request2.status).toEqual(200);
			expect(request2.body).length(2);
			const deletedCheet2 = request2.body
				.filter((cheet) => isCheet(cheet))
				.filter((cheet) => cheet.uuid === "testcheetuuid3");
			expect(deletedCheet2).length(0);
		});
		test("Responds with HTTP status 404 if the user ID provided does not correspond to a user in the database.", async () => {
			const { status, body } = (await request(testApp).delete(
				"/users/testuseruuid3/cheets/testcheetuuid1"
			)) as IResponse;
			expect(status).toEqual(404);
			expect(body).toEqual(["Expected a record, found none."]);
		});
		test("Responds with HTTP status 404 if the cheet to be deleted does not exist in the database.", async () => {
			const { status, body } = (await request(testApp).delete("/cheets/6")) as IResponse;
			expect(status).toEqual(404);
			expect(body).toEqual(["Expected a record, found none."]);
		});
		test("Responds with HTTP status 403 if cheet's userID does not match the session's userID (trying to delete someone else's cheet).", async () => {
			const { status, body } = (await request(testApp).delete("/cheets/testcheetuuid2")) as IResponse;
			expect(status).toEqual(403);
			expect(body).toEqual(["Cannot delete someone else's cheet."]);
		});
	});
});
