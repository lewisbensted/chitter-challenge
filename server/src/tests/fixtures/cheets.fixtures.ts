import { Cheet } from "@prisma/client";

export const testCheets: Cheet[] = [
	{
		id: 1,
		uuid: "testcheetuuid1",
		text: "test cheet 1",
		userId: 1,
		createdAt: new Date(2000, 0, 1, 0, 0, 4),
		updatedAt: new Date(2000, 0, 1, 0, 0, 4),
	},
	{
		id: 2,
		uuid: "testcheetuuid2",
		text: "test cheet 2",
		userId: 2,
		createdAt: new Date(2000, 0, 1, 0, 0, 2),
		updatedAt: new Date(2000, 0, 1, 0, 0, 2),
	},
	{
		id: 3,
		uuid: "testcheetuuid3",
		text: "test cheet 3",
		userId: 1,
		createdAt: new Date(2000, 0, 1, 0, 0, 0),
		updatedAt: new Date(2000, 0, 1, 0, 0, 0),
	},
	{
		id: 4,
		uuid: "testcheetuuid4",
		text: "test cheet 4",
		userId: 1,
		createdAt: new Date(2000, 0, 1, 0, 0, 1),
		updatedAt: new Date(2000, 0, 1, 0, 0, 1),
	},
	{
		id: 5,
		uuid: "testcheetuuid5",
		text: "test cheet 5",
		userId: 2,
		createdAt: new Date(2000, 0, 1, 0, 0, 3),
		updatedAt: new Date(2000, 0, 1, 0, 0, 3),
	},
];
