export interface IUser {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
}

export interface ICheet {
    id: number;
    userId: number;
    username: string;
    text: string;
    createdAt: string;
    updatedAt: string;
}

export interface IReply {
    id: number;
    userId: number;
    username: string;
    cheetId: number;
    text: string;
    createdAt: string;
    updatedAt: string;
}

export interface IMessage {
    id: number;
    senderId: number;
    senderUsername: string;
    recipientId: number;
    recipientUsername: string;
    text: string;
    createdAt: string;
    updatedAt: string;
    isRead: boolean
}

export interface IConversation {
    interlocutorId: number,
    interlocutorUsername: string
    unread: number
}
