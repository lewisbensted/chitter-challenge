import { describe, expect, test } from "vitest";
import { createMockRes } from "../../test-utils/createMockRes";
import { validateHandler } from "../../../src/routes/validate";
import { Request } from "express";

describe("validate", () => {
	test("success", () => {
		const mockReq = {
			session: { user: { uuid: "testuseruuid1" } },
			query: {},
		} as unknown as Request;
		const mockRes = createMockRes();
		validateHandler(mockReq, mockRes);
		expect(mockRes.status).toHaveBeenCalledWith(200);
		expect(mockRes.json).toHaveBeenCalledWith("testuseruuid1");
	});
});
