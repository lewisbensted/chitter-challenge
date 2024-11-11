import { Cheet, Reply, User } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { config } from "dotenv";
import { logError } from "../src/utils/logError.js";
import prisma from "./prismaClient.js";

config({ path: `../.env.${process.env.NODE_ENV}` });

async function seed() {
	if (
		!process.env.NODE_ENV ||
		!["development", "test"].includes(process.env.NODE_ENV)
	) {
		throw new Error(
			"This action is only permissable in the development or test environments."
		);
	}

	await prisma.reply.deleteMany();
	await prisma.cheet.deleteMany();
	await prisma.user.deleteMany();

	const users: User[] = [];
	const cheets: Cheet[] = [];
	const replies: Reply[] = [];

	const numUsers = 20;

	let cheetId = 1;
	let replyId = 1;

	for (let userId = 1; userId <= numUsers; userId++) {
		const firstName = faker.person.firstName();
		const lastName = faker.person.lastName();
		const username = faker.internet.userName({
			firstName: firstName,
			lastName: lastName,
		});

		users.push({
			id: userId,
			firstName,
			lastName,
			email: faker.internet.email({ firstName: firstName, lastName: lastName }),
			username: username,
			password: faker.internet.password(),
		});

		for (let cheet = 0; cheet < Math.ceil(Math.random() * 10); cheet++) {
			cheets.push({
				id: cheetId,
				userId: userId,
				text: faker.lorem.sentence().slice(0, 50),
				username: username,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
			cheetId++;
		}
	}

	for (const user of users) {
		for (let reply = 0; reply < Math.ceil(Math.random() * 20); reply++) {
			replies.push({
				id: replyId,
				userId: user.id,
				text: faker.lorem.sentence().slice(0, 50),
				cheetId: Math.ceil(Math.random() * (cheetId - 1)),
				createdAt: new Date(),
				updatedAt: new Date(),
				username: user.username,
			});
			replyId++;
		}
	}

	await prisma.user.createMany({ data: users });
	await prisma.cheet.createMany({ data: cheets });
	await prisma.reply.createMany({ data: replies });
}

prisma
	.$connect()
	.then(async () => {
		await seed();
		console.log("Test data successfully seeded to database.");
	})
	.catch((error) => {
		console.error("Error seeding test data to database:\n" + logError(error));
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
