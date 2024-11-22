import { Reply } from "@prisma/client";

export const testReplies: Reply[] = [
	{
		id: 1,
		uuid: 'testreplyuuid1',
		text: "test reply 1",
		userId: 1,
		cheetId: 1,
		createdAt: new Date(2000, 0, 1, 0, 0, 0),
		updatedAt: new Date(2000, 0, 1, 0, 0, 0),
	},
	{
		id: 2,
		uuid: 'testreplyuuid2',
		text: "test reply 2",
		userId: 1,
		cheetId: 5,
		createdAt: new Date(2000, 0, 1, 0, 0, 1),
		updatedAt: new Date(2000, 0, 1, 0, 0, 1),
	},
	{
		id: 3,
		uuid: 'testreplyuuid3',
		text: "test reply 3",
		userId: 1,
		cheetId: 2,
		createdAt: new Date(2000, 0, 1, 0, 0, 2),
		updatedAt: new Date(2000, 0, 1, 0, 0, 2),
	},
	{
		id: 4,
		uuid: 'testreplyuuid4',
		text: "test reply 4",
		userId: 1,
		cheetId: 2,
		createdAt: new Date(2000, 0, 1, 0, 0, 3),
		updatedAt: new Date(2000, 0, 1, 0, 0, 3),
	},
	{
		id: 5,
		uuid: 'testreplyuuid5',
		text: "test reply 5",
		userId: 2,
		cheetId: 3,
		createdAt: new Date(2000, 0, 1, 0, 0, 4),
		updatedAt: new Date(2000, 0, 1, 0, 0, 4),
	},
	{
		id: 6,
		uuid: 'testreplyuuid6',
		text: "test reply 6",
		userId: 2,
		cheetId: 2,
		createdAt: new Date(2000, 0, 1, 0, 0, 5),
		updatedAt: new Date(2000, 0, 1, 0, 0, 5),
	},
	{
		id: 7,
		uuid: 'testreplyuuid7',
		text: "test reply 7",
		userId: 2,
		cheetId: 3,
		createdAt: new Date(2000, 0, 1, 0, 0, 6),
		updatedAt: new Date(2000, 0, 1, 0, 0, 6),
	},
	{
		id: 8,
		uuid: 'testreplyuuid8',
		text: "test reply 8",
		userId: 2,
		cheetId: 2,
		createdAt: new Date(2000, 0, 1, 0, 0, 7),
		updatedAt: new Date(2000, 0, 1, 0, 0, 7),
	},

	{
		id: 9,
		uuid: 'testreplyuuid9',
		text: "test reply 9",
		userId: 2,
		cheetId: 3,
		createdAt: new Date(2000, 0, 1, 0, 0, 8),
		updatedAt: new Date(2000, 0, 1, 0, 0, 8),
	},
	{
		id: 10,
		uuid: 'testreplyuuid10',
		text: "test reply 10",
		userId: 2,
		cheetId: 5,
		createdAt: new Date(2000, 0, 1, 0, 0, 9),
		updatedAt: new Date(2000, 0, 1, 0, 0, 9),
	}
];