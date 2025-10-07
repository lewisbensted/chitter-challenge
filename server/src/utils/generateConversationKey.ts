export const generateConversationKey = (user1Id: string, user2Id: string) => [user1Id, user2Id].sort().join(":");
