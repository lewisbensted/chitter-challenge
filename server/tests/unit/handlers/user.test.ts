import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("../../../src/utils/sendErrorResponse", () => ({
	sendErrorResponse: vi.fn(),
}));
vi.mock("../../../src/utils/logError", () => ({
	logError: vi.fn(),
}));

import { createMockRes, MockResponse } from "../../test-utils/createMockRes";
import { createMockReq, MockRequest } from "../../test-utils/createMockReq";
import { getUserHandler, searchUsersHandler } from "../../../src/routes/users";
import { prismaMock } from "../../test-utils/prismaMock";
import { sendErrorResponse } from "../../../src/utils/sendErrorResponse";
import { logError } from "../../../src/utils/logError";
import { Response, Request } from "express";
import { SearchUsersRequest } from "../../../types/requests";

describe("User handlers", () => {
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
	describe("Search for single user at route [GET] /users/:userId", () => {
		test("Invalid userId param provided", async () => {
			mockReq.session.user = { uuid: "mocksessionuserid" };
			await getUserHandler(prismaMock)(mockReq as Request, mockRes as unknown as Response);
			expect(sendErrorResponse).toHaveBeenCalledWith(expect.any(Error), mockRes);
			expect(logError).toHaveBeenCalledWith(expect.any(Error));
		});
		test("Success - is following", async () => {
			mockReq.session.user = { uuid: "mocksessionuserid" };
			prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockuserid",
				followers: [{ followerId: "mocksessionuserid" }],
			});
			await getUserHandler(prismaMock)(mockReq as Request, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({
				user: { uuid: "mockuserid" },
				isFollowing: true,
			});
		});
		test("Success - is not following", async () => {
			mockReq.session.user = { uuid: "mocksessionuserid" };
			prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockuserid",
				followers: [],
			});
			await getUserHandler(prismaMock)(mockReq as Request, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({
				user: { uuid: "mockuserid" },
				isFollowing: false,
			});
		});
		test("Success - no active session", async () => {
			prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce({
				uuid: "mockuserid",
			});
			await getUserHandler(prismaMock)(mockReq as Request, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({
				user: { uuid: "mockuserid" },
				isFollowing: null,
			});
		});
	});
	describe("Search for multiple users at route [GET] /users", () => {
		let fetchUsersMock: ReturnType<typeof vi.fn>;
		beforeEach(() => {
			fetchUsersMock = vi.fn().mockResolvedValue({ users: [], hasNext: false });
		});
		afterEach(() => {
			vi.clearAllMocks();
		});
		test("Success", async () => {
			mockReq.query.search = "search";
			mockReq.query.take = String(20);
			mockReq.query.cursor = "valid";
			prismaMock.user.findUnique.mockResolvedValueOnce("valid");
			await searchUsersHandler(prismaMock, fetchUsersMock)(
				mockReq as SearchUsersRequest,
				mockRes as unknown as Response
			);
			expect(fetchUsersMock).toHaveBeenCalledWith(prismaMock, 20, "search", undefined, "valid");
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ users: [], hasNext: false });
		});
		test("No search param", async () => {
			await searchUsersHandler(prismaMock, fetchUsersMock)(
				mockReq as SearchUsersRequest,
				mockRes as unknown as Response
			);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ users: [], hasNext: false });
		});
		test("Empty search string", async () => {
			mockReq.query.search = "";
			await searchUsersHandler(prismaMock, fetchUsersMock)(
				mockReq as SearchUsersRequest,
				mockRes as unknown as Response
			);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ users: [], hasNext: false });
		});
		test("Invalid take", async () => {
			mockReq.query.search = "search";
			mockReq.query.take = "invalid";
			await searchUsersHandler(prismaMock, fetchUsersMock)(
				mockReq as SearchUsersRequest,
				mockRes as unknown as Response
			);
			expect(fetchUsersMock).toHaveBeenCalledWith(prismaMock, 10, "search", undefined, undefined);
		});
		test("Take clamped at max value", async () => {
			mockReq.query.search = "search";
			mockReq.query.take = String(100);
			await searchUsersHandler(prismaMock, fetchUsersMock)(
				mockReq as SearchUsersRequest,
				mockRes as unknown as Response
			);
			expect(fetchUsersMock).toHaveBeenCalledWith(prismaMock, 50, "search", undefined, undefined);
		});
		test("Invalid cursor", async () => {
			mockReq.query.search = "search";
			mockReq.query.cursor = "invalid";
			prismaMock.user.findUnique.mockResolvedValueOnce(null);
			await searchUsersHandler(prismaMock, fetchUsersMock)(
				mockReq as SearchUsersRequest,
				mockRes as unknown as Response
			);
			expect(fetchUsersMock).toHaveBeenCalledWith(prismaMock, 10, "search", undefined, undefined);
		});
		test("Error", async () => {
			mockReq.query.search = "search";
			fetchUsersMock.mockRejectedValueOnce(new Error("DB exploded"));
			await searchUsersHandler(prismaMock, fetchUsersMock)(
				mockReq as SearchUsersRequest,
				mockRes as unknown as Response
			);
			expect(sendErrorResponse).toHaveBeenCalledWith(expect.any(Error), mockRes);
			expect(logError).toHaveBeenCalledWith(expect.any(Error));
		});
	});
});
