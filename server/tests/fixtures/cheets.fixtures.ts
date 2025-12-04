const baseTime = new Date(2000, 0, 1, 0, 0, 0);
export const testCheets = [
	...Array.from({ length: 10 }, (_, i) => ({
		uuid: `testcheetid${i + 1}`,
		text: `Test Cheet ${i + 1}`,
		userId: `testuserid${(i % 3) + 1}`,
		createdAt: new Date(baseTime.getTime() + i * 1000),
		updatedAt: new Date(baseTime.getTime() + i * 1000),
	})),
];

// export const testCheetStatuses = [
// 	...Array.from({ length: 10 }, (_, i) => ({
// 		cheetId: `testcheetid${i + 1}`,
// 		hasReplies: i % 2 === 0,
// 	})),
// ];
