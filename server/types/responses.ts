export interface IUser {
	uuid: string;
	username: string;
	followers?: string[]
}

export interface ICheet {
	uuid: string;
	text: string;
	createdAt: Date;
	updatedAt: Date;
	user: IUser;
	cheetStatus: ICheetStatus;
}

export interface ICheetStatus {
	hasReplies: boolean;
}

export interface IReply {
	uuid: string;
	text: string;
	createdAt: Date;
	updatedAt: Date;
	cheetId: string;
	user: IUser;
}

export interface IMessage {
	uuid: string;
	sender: IUser;
	recipient: IUser;
	text: string | null;
	createdAt: Date;
	updatedAt: Date;
	messageStatus: IMessageStatus;
}

export interface IMessageStatus {
	isRead: boolean;
	isDeleted: boolean;
}

export interface IConversation {
	key: string;
	user1: IUser;
	user1Unread: boolean;
	user2: IUser;
	user2Unread: boolean;
	latestMessage: IMessage
}
