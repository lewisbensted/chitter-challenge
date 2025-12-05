

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

export const sessionUserCheet = {
	uuid: "sessionusercheetid",
	text: `Session User Cheet`,
	userId: `testusersessionid`,
};

export const sessionUserCheetStatus = {
	cheetId: "sessionusercheetid",
	hasReplies: false,
};
