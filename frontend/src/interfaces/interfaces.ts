export interface IUser {
	uuid: string;
	username: string;
	firstName: string;
	lastName: string;
	email: string
}

export interface ICheet {
	uuid: string;
	text: string;
	createdAt: string;
	updatedAt: string;
	user: IUser;
	cheetStatus: CheetStatus;
}

export interface CheetStatus {
	hasReplies: boolean;
}

export interface IReply {
	uuid: string;
	text: string;
	createdAt: string;
	updatedAt: string;
	cheet: ICheet;
	user: IUser;
}

export interface IMessage {
	uuid: string;
	sender: IUser;
	recipient: IUser;
	text: string | null;
	createdAt: string;
	updatedAt: string;
	messageStatus: MessageStatus;
}

export interface MessageStatus {
	isRead: boolean;
	isDeleted: boolean;
}

export interface LatestMessage {
	text: string | null;
	senderId: string;
	createdAt: string;
	messageStatus: MessageStatus;
}

export interface IConversation {
	interlocutorId: string;
	interlocutorUsername: string;
	unread: boolean;
	latestMessage: LatestMessage | null
}
