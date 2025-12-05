const baseTime = new Date(2001, 0, 1, 0, 0, 0);
export const testReplies = [
	...Array.from({ length: 10 }, (_, i) => ({
		uuid: `testreplyid${i + 1}`,
		text: `Test Reply ${i + 1}`,
		cheetId: "testcheetid1",
		userId: `testuserid${((i + 1) % 3) + 1}`,
		createdAt: new Date(baseTime.getTime() + i * 1000),
		updatedAt: new Date(baseTime.getTime() + i * 1000),
	})),
];

export const sessionUserReply = {
	uuid: "sessionuserreplyid",
	text: "Session User Reply",
	userId: "testusersessionid",
	cheetId: "sessionusercheetid",
};
