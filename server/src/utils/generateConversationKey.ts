export const generateConversationKey = (user1Id: string, user2Id: string) => {
	return [user1Id, user2Id].sort().join(":");
};
