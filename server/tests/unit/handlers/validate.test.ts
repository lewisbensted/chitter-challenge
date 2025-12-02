import { beforeEach, describe, expect, test } from "vitest";
import { createMockReq, MockRequest } from "../../test-utils/createMockReq";
import { validateHandler } from "../../../src/routes/validate";
import { createMockRes, MockResponse } from "../../test-utils/createMockRes";
import { Response, Request } from "express";

describe("Unit tests - Validate handler", () => {
	let mockReq: MockRequest;
	let mockRes: MockResponse;
	beforeEach(() => {
		mockReq = createMockReq();
		mockRes = createMockRes();
	});
	describe("validateHandler()", () => {
		test("Success", () => {
			mockReq.session.user = { uuid: "mockuserid" };
			validateHandler(mockReq as unknown as Request, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith("mockuserid");
		});
		test("Unauthorised", () => {
			validateHandler(mockReq as unknown as Request, mockRes as unknown as Response);
			expect(mockRes.status).toHaveBeenCalledWith(401);
			expect(mockRes.json).toHaveBeenCalledWith({ errors: ["Unauthorised."] });
		});
	});
});
