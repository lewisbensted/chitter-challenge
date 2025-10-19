export interface IUser {
	uuid: string;
	username: string;
}

export interface IUserEnhanced {
	user: IUser;
	isFollowing: boolean | null;
	conversation: IConversation | null;
}

export interface ICheet {
	uuid: string;
	text: string;
	createdAt: string;
	updatedAt: string;
	user: IUser;
	cheetStatus: ICheetStatus;
}

export interface ICheetStatus {
	hasReplies: boolean;
}

export interface IReply {
	uuid: string;
	text: string;
	createdAt: string;
	updatedAt: string;
	cheetId: string;
	user: IUser;
}

export interface IMessage {
	uuid: string;
	sender: IUser;
	recipient: IUser;
	text: string | null;
	createdAt: string;
	updatedAt: string;
	messageStatus: IMessageStatus;
}

export interface IMessageStatus {
	isRead: boolean;
	isDeleted: boolean;
}

export interface IConversation {
	key: string;
	interlocutorId: string;
	interlocutorUsername: string;
	unread: boolean;
	latestMessage: IMessage | null;
}
