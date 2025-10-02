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

export interface ILatestMessage {
	text: string | null;
	senderId: string;
	createdAt: Date;
	messageStatus: IMessageStatus;
}

export interface IConversation {
	interlocutorId: string;
	interlocutorUsername: string;
	unread: boolean;
	latestMessage: ILatestMessage | null
}
