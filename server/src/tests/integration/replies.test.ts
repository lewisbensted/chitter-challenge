import express from "express";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { resetDB } from "../resetDB";
import { testUser1, testUser2 } from "../fixtures/users.fixtures";
import prisma from "../../../prisma/prismaClient";
import { registerExtension } from "../../routes/register";
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
        await prisma.$extends(registerExtension).user.create({ data: testUser1 });
        await prisma.$extends(registerExtension).user.create({ data: testUser2 });
        await prisma.cheet.createMany({ data: testCheets });
        await prisma.reply.createMany({ data: testReplies });
    });

    const testApp = express();
    testApp.use("/cheets/:cheetId/replies", express.json(), replies);
    const sessionApp = express();
    sessionApp.use(session({ secret: "secret-key" }));
    sessionApp.all("*", (req, res, next) => {
        req.session.user = { id: 1, username: "testuser1" };
        next();
    });
    sessionApp.use(testApp);

    describe("Test fetchReplies function which fetches relevant replies from the database and sorts them in chronological order.", async () => {
        test("Test different cheet IDs.", async () => {
            const replies1 = await fetchReplies(1);
            expect(replies1).length(1);
            expect([replies1[0].username, replies1[0].text, replies1[0].cheetId]).toEqual([
                "testuser1",
                "test reply 1",
                1,
            ]);

            const replies2 = await fetchReplies(2);
            expect(replies2).length(4);
            expect([replies2[0].username, replies2[0].text, replies2[0].cheetId]).toEqual([
                "testuser1",
                "test reply 3",
                2,
            ]);
            expect([replies2[1].username, replies2[1].text, replies2[1].cheetId]).toEqual([
                "testuser1",
                "test reply 4",
                2,
            ]);
            expect([replies2[2].username, replies2[2].text, replies2[2].cheetId]).toEqual([
                "testuser2",
                "test reply 6",
                2,
            ]);
            expect([replies2[3].username, replies2[3].text, replies2[3].cheetId]).toEqual([
                "testuser2",
                "test reply 8",
                2,
            ]);

            const replies3 = await fetchReplies(3);
            expect(replies3).length(3);
            expect([replies3[0].username, replies3[0].text, replies3[0].cheetId]).toEqual([
                "testuser2",
                "test reply 5",
                3,
            ]);
            expect([replies3[1].username, replies3[1].text, replies3[1].cheetId]).toEqual([
                "testuser2",
                "test reply 7",
                3,
            ]);
            expect([replies3[2].username, replies3[2].text, replies3[2].cheetId]).toEqual([
                "testuser2",
                "test reply 9",
                3,
            ]);

            const replies4 = await fetchReplies(4);
            expect(replies4).length(0);

            const replies5 = await fetchReplies(5);
            expect(replies5).length(2);
            expect([replies5[0].username, replies5[0].text, replies5[0].cheetId]).toEqual([
                "testuser1",
                "test reply 2",
                5,
            ]);
            expect([replies5[1].username, replies5[1].text, replies5[1].cheetId]).toEqual([
                "testuser2",
                "test reply 10",
                5,
            ]);
        });

        describe("Fetch replies at route: [GET] /replies.", async () => {
            test("Responds with HTTP status 200 and all replies relevant to the cheet specified in the request params.", async () => {
                const request1 = await request(testApp).get("/cheets/1/replies");
                expect(request1.status).toEqual(200);
                expect(request1.body).length(1);

                const request2 = await request(sessionApp).get("/cheets/2/replies");
                expect(request2.status).toEqual(200);
                expect(request2.body).length(4);

                const request3 = await request(sessionApp).get("/cheets/3/replies");
                expect(request3.status).toEqual(200);
                expect(request3.body).length(3);

                const request4 = await request(sessionApp).get("/cheets/4/replies");
                expect(request4.status).toEqual(200);
                expect(request4.body).length(0);

                const request5 = await request(sessionApp).get("/cheets/5/replies");
                expect(request5.status).toEqual(200);
                expect(request5.body).length(2);
            });
            test("Responds with HTTP status 400 when an invalid cheet ID is provided.", async () => {
                const { status, body } = await request(sessionApp).get("/cheets/1a/replies");
                expect(status).toEqual(400);
                expect(body).toEqual(["Invalid cheet ID provided - must be a number."]);
            });
            test("Responds with HTTP status 404 if reply's target cheet does not exist in the database.", async () => {
                const { status, body } = await request(sessionApp).get("/cheets/6/replies");
                expect(status).toEqual(404);
                expect(body).toEqual(["No Cheet found with ID provided."]);
            });
        });
        describe("Post a new reply at route: [POST] /replies.", async () => {
            test("Responds with HTTP status 201 and all relevant replies when a new reply is created.", async () => {
                const { status, body } = await request(sessionApp)
                    .post("/cheets/1/replies")
                    .send({ text: "new test reply" });
                expect(status).toEqual(201);
                expect(body).length(2);
                expect([body[1].username, body[1].text]).toEqual(["testuser1", "new test reply"]);
            });
            test("Responds with HTTP status 400 if reply validation fails - text too short.", async () => {
                const { status, body } = await request(sessionApp).post("/cheets/1/replies").send({ text: "test" });
                expect(status).toEqual(400);
                expect(body).toEqual(["Reply too short - must be between 5 and 50 characters."]);
            });
            test("Responds with HTTP status 400 if reply validation fails - no text field.", async () => {
                const { status, body } = await request(sessionApp).post("/cheets/1/replies");
                expect(status).toEqual(400);
                expect(body).toEqual(["Text not provided."]);
            });
            test("Responds with HTTP status 400 when an invalid cheet ID is provided.", async () => {
                const { status, body } = await request(sessionApp)
                    .post("/cheets/1a/replies")
                    .send({ text: "new test reply" });
                expect(status).toEqual(400);
                expect(body).toEqual(["Invalid cheet ID provided - must be a number."]);
            });
            test("Responds with HTTP status 404 if reply's target cheet does not exist in the database.", async () => {
                const { status, body } = await request(sessionApp)
                    .post("/cheets/6/replies")
                    .send({ text: "new test reply" });
                expect(status).toEqual(404);
                expect(body).toEqual(["No Cheet found with ID provided."]);
            });
            test("Responds with HTTP status 500 if the session's user ID and username do not match the composite key in the users table.", async () => {
                const sessionAppIncorrect = express();
                sessionAppIncorrect.use(session({ secret: "secret-key" }));
                sessionAppIncorrect.all("*", (req, res, next) => {
                    req.session.user = { id: 1, username: "testuser2" };
                    next();
                });
                sessionAppIncorrect.use(testApp);
                const { status, body } = await request(sessionAppIncorrect)
                    .post("/cheets/1/replies")
                    .send({ text: "new test reply" });
                expect(status).toEqual(500);
                expect(body).toEqual(["An unexpected error occured."]);
            });
        });

        describe("Updates an existing reply at route: [PUT] /replies.", async () => {
            test("Responds with HTTP status 200 and all relevant replies when a reply is updated.", async () => {
                const { status, body } = await request(sessionApp)
                    .put("/cheets/1/replies/1")
                    .send({ text: "test reply 1 - updated" });
                expect(status).toEqual(200);
                expect(body).length(1);
                expect([body[0].username, body[0].text]).toEqual(["testuser1", "test reply 1 - updated"]);
            });
            test("Responds with HTTP status 400 if reply validation fails - text too short.", async () => {
                const { status, body } = await request(sessionApp).put("/cheets/1/replies/1").send({ text: "test" });
                expect(status).toEqual(400);
                expect(body).toEqual(["Reply too short - must be between 5 and 50 characters."]);
            });
            test("Responds with HTTP status 400 if reply validation fails - text parameter missing.", async () => {
                const { status, body } = await request(sessionApp).put("/cheets/1/replies/1");
                expect(status).toEqual(400);
                expect(body).toEqual(["Text not provided."]);
            });
            test("Responds with HTTP status 400 when an invalid cheet ID is provided.", async () => {
                const { status, body } = await request(sessionApp)
                    .put("/cheets/1a/replies/1")
                    .send({ text: "test reply 1 - updated" });
                expect(status).toEqual(400);
                expect(body).toEqual(["Invalid cheet ID provided - must be a number."]);
            });
            test("Responds with HTTP status 400 when an invalid reply ID is provided.", async () => {
                const { status, body } = await request(sessionApp)
                    .put("/cheets/1/replies/1a")
                    .send({ text: "test reply 1 - updated" });
                expect(status).toEqual(400);
                expect(body).toEqual(["Invalid reply ID provided - must be a number."]);
            });
            test("Responds with HTTP status 403 if reply's userID does not match the session's userID (trying to update someone else's cheet).", async () => {
                const { status, body } = await request(sessionApp)
                    .put("/cheets/2/replies/6")
                    .send({ text: "test reply 2 - updated" });
                expect(status).toEqual(403);
                expect(body).toEqual(["Cannot update someone else's reply."]);
            });
            test("Responds with HTTP status 404 if the reply to be updated does not exist in the database.", async () => {
                const { status, body } = await request(sessionApp)
                    .put("/cheets/1/replies/11")
                    .send({ text: "test reply 1 - updated" });
                expect(status).toEqual(404);
                expect(body).toEqual(["No Reply found with ID provided."]);
            });
            test("Responds with HTTP status 404 if reply's target cheet does not exist in the database.", async () => {
                const { status, body } = await request(sessionApp)
                    .put("/cheets/6/replies/1")
                    .send({ text: "test reply 1 - updated" });
                expect(status).toEqual(404);
                expect(body).toEqual(["No Cheet found with ID provided."]);
            });
            test("Responds with HTTP status 404 if reply's cheet ID does not match the cheet ID provided.", async () => {
                const { status, body } = await request(sessionApp).put("/cheets/2/replies/1");
                expect(status).toEqual(403);
                expect(body).toEqual(["Cheet IDs do not match."]);
            });
        });

        describe("Deletes an existing reply at route: [DELETE] /replies.", async () => {
            test("Responds with HTTP status 200 and all relevant replies when a reply is deleted.", async () => {
                const { status, body } = await request(sessionApp).delete("/cheets/2/replies/4");
                expect(status).toEqual(200);
                expect(body).length(3);
                expect(body.map((reply: Reply) => reply.id)).not.toContain(4);
            });
            test("Responds with HTTP status 400 when an invalid cheet ID is provided.", async () => {
                const { status, body } = await request(sessionApp).delete("/cheets/1a/replies/1");
                expect(status).toEqual(400);
                expect(body).toEqual(["Invalid cheet ID provided - must be a number."]);
            });
            test("Responds with HTTP status 400 when an invalid reply ID is provided.", async () => {
                const { status, body } = await request(sessionApp).delete("/cheets/1/replies/1a");
                expect(status).toEqual(400);
                expect(body).toEqual(["Invalid reply ID provided - must be a number."]);
            });
            test("Responds with HTTP status 403 if reply's userID does not match the session's userID (trying to update someone else's reply).", async () => {
                const { status, body } = await request(sessionApp).delete("/cheets/2/replies/6");
                expect(status).toEqual(403);
                expect(body).toEqual(["Cannot delete someone else's reply."]);
            });
            test("Responds with HTTP status 404 if the reply to be updated does not exist in the database.", async () => {
                const { status, body } = await request(sessionApp).delete("/cheets/1/replies/11");
                expect(status).toEqual(404);
                expect(body).toEqual(["No Reply found with ID provided."]);
            });
            test("Responds with HTTP status 404 if reply's target cheet does not exist in the database.", async () => {
                const { status, body } = await request(sessionApp).delete("/cheets/6/replies/1");
                expect(status).toEqual(404);
                expect(body).toEqual(["No Cheet found with ID provided."]);
            });
            test("Responds with HTTP status 404 if reply's cheet ID does not match the cheet ID provided.", async () => {
                const { status, body } = await request(sessionApp).delete("/cheets/2/replies/1");
                expect(status).toEqual(403);
                expect(body).toEqual(["Cheet IDs do not match."]);
            });
        });
    });
});
