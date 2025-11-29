import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("../../../src/utils/sendErrorResponse", () => ({
	sendErrorResponse: vi.fn(),
}));
vi.mock("../../../src/utils/logError", () => ({
	logError: vi.fn(),
}));

import { createMockReq, MockRequest } from "../../test-utils/createMockReq";
import { createMockRes, MockResponse } from "../../test-utils/createMockRes";
import { prismaMock } from "../../test-utils/prismaMock";
import { followHandler, unfollowHandler } from "../../../src/routes/follow";
import { Response, Request } from "express";
import { logError } from "../../../src/utils/logError";
import { sendErrorResponse } from "../../../src/utils/sendErrorResponse";

describe("Follow handlers", () => {
	beforeAll(() => {
		vi.spyOn(console, "error").mockImplementation(() => {});
	});
	let mockReq: MockRequest;
	let mockRes: MockResponse;
	beforeEach(() => {
		mockReq = createMockReq();
		mockRes = createMockRes();
	});
	afterAll(() => {
		vi.restoreAllMocks();
	});
	describe("followHandler() function", () => {
		test("Unauthorised", async () => {
			await followHandler(prismaMock)(mockReq as Request, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Unauthorised."] });
		});
		test("Self follow", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.followingId = "mockuserid";
			await followHandler(prismaMock)(mockReq as Request, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(400);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["You cannot follow yourself."] });
		});
		test("Success", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.followingId = "otheruserid";
			prismaMock.follow.create.mockResolvedValueOnce({});
			await followHandler(prismaMock)(mockReq as Request, mockRes as unknown as Response);
			expect(mockRes.sendStatus).toHaveBeenCalledWith(201);
		});
		test("Failure", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.followingId = "otheruserid";
			prismaMock.follow.create.mockRejectedValueOnce(new Error("DB exploded"));
			await followHandler(prismaMock)(mockReq as Request, mockRes as unknown as Response);
			expect(sendErrorResponse).toHaveBeenCalledWith(expect.any(Error), mockRes);
			expect(logError).toHaveBeenCalledWith(expect.any(Error));
		});
	});
	describe("unfollowHandler() function", () => {
		test("Unauthorised", async () => {
			await unfollowHandler(prismaMock)(mockReq as Request, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Unauthorised."] });
		});
		test("Success", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.followingId = "otheruserid";
			prismaMock.follow.delete.mockResolvedValueOnce({});
			await unfollowHandler(prismaMock)(mockReq as Request, mockRes as unknown as Response);
			expect(mockRes.sendStatus).toHaveBeenCalledWith(204);
		});
		test("Record already removed", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.followingId = "otheruserid";
			prismaMock.follow.create.mockRejectedValueOnce({
				code: "P2025",
			});
			await unfollowHandler(prismaMock)(mockReq as Request, mockRes as unknown as Response);
			expect(mockRes.sendStatus).toHaveBeenCalledWith(204);
		});
		test("Failure", async () => {
			mockReq.session.user = { uuid: "mockuserid" };
			mockReq.params.followingId = "otheruserid";
			prismaMock.follow.delete.mockRejectedValueOnce(new Error("DB exploded"));
			await unfollowHandler(prismaMock)(mockReq as Request, mockRes as unknown as Response);
			expect(sendErrorResponse).toHaveBeenCalledWith(expect.any(Error), mockRes);
			expect(logError).toHaveBeenCalledWith(expect.any(Error));
		});
	});
});
