import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("../../../src/utils/sendErrorResponse", () => ({
	sendErrorResponse: vi.fn(),
}));
vi.mock("../../../src/utils/logError", () => ({
	logError: vi.fn(),
}));

import { createMockReq, MockRequest } from "../../test-utils/createMockReq";
import { createMockRes, MockResponse } from "../../test-utils/createMockRes";
import { logoutHandler } from "../../../src/routes/logout";
import { Response, Request } from "express";
import { logError } from "../../../src/utils/logError";
import { sendErrorResponse } from "../../../src/utils/sendErrorResponse";

describe("Logout handler", () => {
	beforeAll(() => {
		vi.spyOn(console, "error").mockImplementation(() => {});
	});
	let mockReq: MockRequest;
	let mockRes: MockResponse;
	beforeEach(() => {
		mockReq = createMockReq();
		mockRes = createMockRes();
	});
	describe("Logout at route: [DELETE] /logout", () => {
		test("success", () => {
			const destroyMock = vi.fn((callback) => callback(null));
			mockReq.session = { user: { id: "mockuserid" }, destroy: destroyMock };
			mockReq.cookies = { token: "mocksession" };
			logoutHandler(mockReq as Request, mockRes as unknown as Response);
			expect(destroyMock).toHaveBeenCalled();
			expect(mockRes.clearCookie).toHaveBeenCalledWith("token");
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith("Logout successful.");
		});
		test("error", () => {
			const destroyMock = vi.fn((callback) => callback(new Error("DB exploded")));
			mockReq.session = { user: { id: "mockuserid" }, destroy: destroyMock };
			mockReq.cookies = { token: "mocksession" };
			logoutHandler(mockReq as Request, mockRes as unknown as Response);
			expect(destroyMock).toHaveBeenCalled();
			expect(sendErrorResponse).toHaveBeenCalledWith(expect.any(Error), mockRes);
			expect(logError).toHaveBeenCalledWith(expect.any(Error));
		});
		test("no session", () => {
			logoutHandler(mockReq as Request, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(403);
			expect(mockRes.json).toHaveBeenCalledWith({
				errors: ["Not logged in."],
			});
		});
	});
});
