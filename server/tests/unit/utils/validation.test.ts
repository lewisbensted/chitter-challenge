import { test, describe, expect } from "vitest";

import { isValidName, nameExp1, passwordExp1, passwordExp2 } from "../../../src/utils/validation";

describe("Validation", () => {
	describe("Name validation", () => {
		test("Permitted characters.", () => {
			expect("L").toMatch(nameExp1);
			expect("testname").toMatch(nameExp1);
			expect("TESTNAME").toMatch(nameExp1);
			expect("test name").toMatch(nameExp1);
			expect("D'Angelo Barksdale").toMatch(nameExp1);
			expect("D'Angelo-Barksdale").toMatch(nameExp1);
			expect("Trent Alexander-Arnold").toMatch(nameExp1);
			expect("Invalid.Name").not.toMatch(nameExp1);
			expect("Invalid@Name").not.toMatch(nameExp1);
			expect("Invalid3Name").not.toMatch(nameExp1);
			expect("@!£").not.toMatch(nameExp1);
			expect("").toMatch(nameExp1);
			expect("'").toMatch(nameExp1);
			expect("-").toMatch(nameExp1);
			expect(" ").toMatch(nameExp1);
			expect("DA'ngelo").toMatch(nameExp1);
			expect("- -' -'").toMatch(nameExp1);
			expect("ji b- 'b '-er --' ish").toMatch(nameExp1);
		});
		test("isValidName()", () => {
			expect(isValidName("L")).toBe(false);
			expect(isValidName("Le")).toBe(true);
			expect(isValidName("test name")).toBe(true);
			expect(isValidName("invalid.name")).toBe(false);
			expect(isValidName("invalid3name")).toBe(false);
			expect(isValidName("invalid@name")).toBe(false);
			expect(isValidName("Marshall Mathers III")).toBe(false);
			expect(isValidName("Trent Alexander-Arnold")).toBe(false);
			expect(isValidName("D'Angelo Barksdale")).toBe(true);
			expect(isValidName("DA'ngelo Barksdale")).toBe(false);
			expect(isValidName("D'Angelo D'Artagnan")).toBe(true);
			expect(isValidName("D'Angelo-D'Artagnan")).toBe(true);
			expect(isValidName("Trent Alexander-Arnold", 3)).toBe(true);
			expect(isValidName("Marshall Mathers III", 3)).toBe(true);
			expect(isValidName("Jean-Baptiste Emmanuel Zorg", 3)).toBe(false);
			expect(isValidName("Jean-Baptiste Emmanuel Zorg", 4)).toBe(true);
			expect(isValidName("-")).toBe(false);
			expect(isValidName("--")).toBe(false);
			expect(isValidName(" - - ")).toBe(false);
			expect(isValidName(" ")).toBe(false);
			expect(isValidName("")).toBe(false);
			expect(isValidName("t-n")).toBe(false);
			expect(isValidName("t--n")).toBe(false);
			expect(isValidName("t-")).toBe(false);
			expect(isValidName("-t")).toBe(false);
			expect(isValidName("t''n")).toBe(false);
			expect(isValidName("-testname-")).toBe(false);
			expect(isValidName("t'")).toBe(false);
			expect(isValidName("'t")).toBe(false);
			expect(isValidName("t'n")).toBe(false);
			expect(isValidName(" -' ")).toBe(false);
			expect(isValidName("-'A-")).toBe(false);
			expect(isValidName("A ' B")).toBe(false);
			expect(isValidName("A - B")).toBe(false);
		});
	});
	describe("Password validation", () => {
		test("Required characters", () => {
			expect("Testpassword1!").toMatch(passwordExp1);
			expect("Testpassword1.").toMatch(passwordExp1);
			expect("Test*password1").toMatch(passwordExp1);
			expect("Test1password1!").toMatch(passwordExp1);
			expect("testpassword1").not.toMatch(passwordExp1);
			expect("testpassword!").not.toMatch(passwordExp1);
			expect("A1!").toMatch(passwordExp1);
			expect("123*!.").not.toMatch(passwordExp1);
			expect("12345").not.toMatch(passwordExp1);
			expect("*!.%$").not.toMatch(passwordExp1);
			expect("abc123").not.toMatch(passwordExp1);
			expect("abc.!*").not.toMatch(passwordExp1);
		});
		test("No whitespace", () => {
			expect("test password1!").not.toMatch(passwordExp2);
			expect("test\npassword1!").not.toMatch(passwordExp2);
			expect("testpassword1! ").not.toMatch(passwordExp2);
			expect("testpassword!\n").not.toMatch(passwordExp2);
		});
	});
});
