import type { User } from "@prisma/client";

export const validTestUsers: User[] = [
	{
		id: 1,
		uuid: "testuseruuid1",
		email: "testuser1@test.com",
		firstName: "Test",
		lastName: "User",
		passwordHash: "placeholder",
		username: "testuser1",
	},

	{
		id: 2,
		uuid: "testuseruuid2",
		email: "testuser2@test.com",
		firstName: "Test",
		lastName: "User",
		passwordHash: "placeholder",
		username: "testuser2",
	},
	{
		id: 3,
		uuid: "testuseruuid3",
		email: "testuser3@test.com",
		firstName: "Test",
		lastName: "User",
		passwordHash: "placeholder",
		username: "testuser3",
	},

	{
		id: 4,
		uuid: "testuseruuid4",
		email: "testuser4@test.com",
		firstName: "Test",
		lastName: "User",
		passwordHash: "placeholder",
		username: "testuser4",
	},

	{
		id: 5,
		uuid: "testuseruuid5",
		email: "testuser5@test.com",
		firstName: "Test",
		lastName: "User",
		passwordHash: "placeholder",
		username: "testuser5",
	},
	{
		id: 6,
		uuid: "testuseruuid6",
		email: "testuser6@test.com",
		firstName: "Test",
		lastName: "User",
		passwordHash: "placeholder",
		username: "testuserunique",
	},
];
