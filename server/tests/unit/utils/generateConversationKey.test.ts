import { describe, expect, test } from "vitest";
import { generateConversationKey } from "../../../src/utils/generateConversationKey";

describe("generateConversationKey()", () => {
	test("generateConversationKey()", () => {
		expect(generateConversationKey("abc", "def")).toBe("abc:def");
		expect(generateConversationKey("def", "abc")).toBe("abc:def");
	});
});
