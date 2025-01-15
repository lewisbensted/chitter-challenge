import { test, describe, expect } from "vitest";
import {
	firstNameExp1,
	firstNameExp2,
	lastNameExp1,
	lastNameExp2,
	passwordExp1,
	passwordExp2,
} from "../../schemas/user.schema";

describe("Test regex associated with registering a new user.", () => {
	describe("Test first name regex.", () => {
		test("Check permitted charachters.", () => {
			expect("Testname").toMatch(firstNameExp1);
			expect("TestNAME").toMatch(firstNameExp1);
			expect("Test name").toMatch(firstNameExp1);
			expect("Test-name").toMatch(firstNameExp1);
			expect("Test -name").toMatch(firstNameExp1);
			expect("Tes tna me").toMatch(firstNameExp1);
			expect("Test -name").toMatch(firstNameExp1);
			expect("Testname!").not.toMatch(firstNameExp1);
			expect("Test.name").not.toMatch(firstNameExp1);
			expect("Testname1").not.toMatch(firstNameExp1);
			expect("Test'name").not.toMatch(firstNameExp1);
		});
		test("Check correct format.", () => {
			expect("Testname").toMatch(firstNameExp2);
			expect("TestNAME").toMatch(firstNameExp2);
			expect("Test name").toMatch(firstNameExp2);
			expect("Test-name").toMatch(firstNameExp2);
			expect("Test -name").not.toMatch(firstNameExp2);
			expect("Testna me").toMatch(firstNameExp2);
			expect("Testnam e").not.toMatch(firstNameExp2);
			expect("Tes tna me").not.toMatch(firstNameExp2);
			expect("Tes tna-me").not.toMatch(firstNameExp2);
			expect("Testname!").toMatch(firstNameExp2);
			expect("Test.name").toMatch(firstNameExp2);
			expect("Testname1").toMatch(firstNameExp2);
			expect("Test'name").toMatch(firstNameExp2);
			expect("ABD123 £$%DEF").toMatch(firstNameExp2);
			expect("ABD123  £$%DEF").not.toMatch(firstNameExp2);
			expect("T").toMatch(firstNameExp2);
			expect("T es").not.toMatch(firstNameExp2);
		});

		describe("Test last name regex.", () => {
			test("Check permitted charachters.", () => {
				expect("Testname").toMatch(lastNameExp1);
				expect("TestNAME").toMatch(lastNameExp1);
				expect("Test name").toMatch(lastNameExp1);
				expect("Test-name").toMatch(lastNameExp1);
				expect("Test -name").toMatch(lastNameExp1);
				expect("Tes tna me").toMatch(lastNameExp1);
				expect("Test -name").toMatch(lastNameExp1);
				expect("Testname!").not.toMatch(lastNameExp1);
				expect("Test.name").not.toMatch(lastNameExp1);
				expect("Testname1").not.toMatch(lastNameExp1);
				expect("Test'name").toMatch(lastNameExp1);
				expect("Te'st - na'me").toMatch(lastNameExp1);
			});
			test("Check correct format.", () => {
				expect("Testname").toMatch(lastNameExp2);
				expect("TestNAME").toMatch(lastNameExp2);
				expect("Test name").toMatch(lastNameExp2);
				expect("Test-name").toMatch(lastNameExp2);
				expect("Test -name").not.toMatch(lastNameExp2);
				expect("Tes tna me").toMatch(lastNameExp2);
				expect("Test n ame").not.toMatch(lastNameExp2);
				expect("Test na me").toMatch(lastNameExp2);
				expect("Tes-tna-me").toMatch(lastNameExp2);
				expect("Tes tna-me").toMatch(lastNameExp2);
				expect("Testname!").toMatch(lastNameExp2);
				expect("Test.name").toMatch(lastNameExp2);
				expect("Testname1").toMatch(lastNameExp2);
				expect("ABD 123£-$%DEF").toMatch(lastNameExp2);
				expect("ABD 123£ $%DEF").toMatch(lastNameExp2);
				expect("ABD123  £$%DEF").not.toMatch(lastNameExp2);
				expect("ABD 123  £$%DEF").not.toMatch(lastNameExp2);
				expect("ABD 123-£$%D EF").not.toMatch(lastNameExp2);
				expect("D'Artagnan").toMatch(lastNameExp2);
				expect("DA'rtagnan").not.toMatch(lastNameExp2);
				expect("D'Art a'gnan").toMatch(lastNameExp2);
				expect("D'Art-a'gnan").toMatch(lastNameExp2);
				expect("D'Art ag'nan").not.toMatch(lastNameExp2);
				expect("D'Art-a'gnan").toMatch(lastNameExp2);
				expect("DArt ag'nan").not.toMatch(lastNameExp2);
				expect("O'Brian O'Leary-O'Shea").toMatch(lastNameExp2);
				expect("T").toMatch(lastNameExp2);
				expect("T es st").not.toMatch(firstNameExp2);
				expect("Te s st").not.toMatch(firstNameExp2);
			});
		});
	});
	describe("Test password regex.", () => {
		test("Check required charachters", () => {
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
		test("Check no whitespace", () => {
			expect("test password1!").not.toMatch(passwordExp2);
			expect("test\npassword1!").not.toMatch(passwordExp2);
			expect("testpassword1! ").not.toMatch(passwordExp2);
			expect("testpassword!\n").not.toMatch(passwordExp2);
		});
	});
});
