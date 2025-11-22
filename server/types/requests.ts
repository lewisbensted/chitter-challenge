import { Request } from "express";
import type { ICheet, IMessage, IReply, IUser } from "./responses.js";

export interface RegisterUserRequestBody {
	firstName: string;
	lastName: string;
	username: string;
	email: string;
	password: string;
}

export type RegisterUserRequest = Request<Record<string, never>, IUser, RegisterUserRequestBody>;

export type SendCheetRequest = Request<{}, ICheet, { text: string }> & {
	session: { user?: { uuid: string } };
};

export type EditCheetRequest = Request<{ cheetId: string }, ICheet, { text: string }> & {
	session: { user?: { uuid: string } };
};

export type SendReplyRequest = Request<{ cheetId: string }, IReply, { text: string }>;

export type EditReplyRequest = Request<{ cheetId: string; replyId: string }, IReply, { text: string }>;

export type SendMessageRequest = Request<{ senderId: string; recipientId: string }, IMessage, { text: string }>;

export type EditMessageRequest = Request<
	{ senderId: string; recipientId: string; messageId: string },
	IMessage,
	{ text: string }
>;

export type SearchUsersRequest = Request<{}, ICheet, {}, { search?: string; take?: string; cursor?: string }> & {
	session: { user?: { uuid: string } };
};
