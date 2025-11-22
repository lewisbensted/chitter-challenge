const baseTime = new Date(2000, 0, 1, 0, 0, 0);
export const testCheets = [
	...Array.from({ length: 10 }, (_, i) => ({
		uuid: `testcheetuuid${i + 1}`,
		text: `Test Cheet ${i + 1}`,
		userId: `testuseruuid${(i % 3) + 1}`,
		createdAt: new Date(baseTime.getTime() + i * 1000),
		updatedAt: new Date(baseTime.getTime() + i * 1000),
	})),
	{
		uuid: `testcheetuuidrecent`,
		text: `Test Cheet Recent`,
		userId: `testuseruuid1`,
	},
	{
		uuid: `testcheetuuidhasreplies`,
		text: `Test Cheet Has Replies`,
		userId: `testuseruuid1`,
	},
];

export const testCheetStatuses = [
	...Array.from({ length: 10 }, (_, i) => ({
		cheetId: `testcheetuuid${i + 1}`,
		hasReplies: i % 2 == 0,
	})),
	{
		cheetId: `testcheetuuidrecent`,
		hasReplies: false,
	},
	{
		cheetId: `testcheetuuidhasreplies`,
		hasReplies: true,
	},
];
