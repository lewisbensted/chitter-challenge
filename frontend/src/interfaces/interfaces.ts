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
	text: string;
	createdAt: string;
	updatedAt: string;
	isRead: boolean;
	isDeleted: boolean
}

export interface IConversation {
	interlocutorId: string;
	interlocutorUsername: string;
	unread: number;
	latestMessage?: { text: string; senderId: string; isRead: boolean; createdAt: string };
}
