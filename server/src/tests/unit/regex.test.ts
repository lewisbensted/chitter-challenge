import { test, describe, vi, expect } from "vitest";
import { nameExp, passwordExp1, passwordExp2 } from "../../schemas/user.schema";

describe("Test regex associated with registering a new user.", async () => {
    test("Test first name regex.", async () => {
        expect("Testname").toMatch(nameExp);
        expect("testNAME").toMatch(nameExp);
        expect("Test name").toMatch(nameExp);
        expect("Test-name").toMatch(nameExp);
        expect("Test- name").toMatch(nameExp);
        expect("T'estname").toMatch(nameExp);
        expect("T'est name").toMatch(nameExp);
        expect("Testname!").not.toMatch(nameExp);
        expect("Test.name").not.toMatch(nameExp);
        expect("Testname1").not.toMatch(nameExp);
    });
    test("Test password regex.", async () => {
        expect("Testpassword1!").toMatch(passwordExp1);
        expect("Testpassword1.").toMatch(passwordExp1);
        expect("Test*password1").toMatch(passwordExp1);
        expect("Test1password1!").toMatch(passwordExp1);
        expect("testpassword1").not.toMatch(passwordExp1);
        expect("testpassword!").not.toMatch(passwordExp1);
        expect("A1!").toMatch(passwordExp1)
        expect("123*!.").not.toMatch(passwordExp1);
        expect("12345").not.toMatch(passwordExp1);
        expect("*!.%$").not.toMatch(passwordExp1);
        expect("abc123").not.toMatch(passwordExp1);
        expect("abc.!*").not.toMatch(passwordExp1);

        expect("test password1!").not.toMatch(passwordExp2);
        expect("test\npassword1!").not.toMatch(passwordExp2);
        expect("testpassword1! ").not.toMatch(passwordExp2);
        expect("testpassword!\n").not.toMatch(passwordExp2);
    });
});
