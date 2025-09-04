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

export type SendCheetRequest = Request<{ userId: string }, ICheet, { text: string }>;

export type EditCheetRequest = Request<{ userId: string; cheetId: string }, ICheet, { text: string }>;

export type SendReplyRequest = Request<{ userId: string; cheetId: string }, IReply, { text: string }>;

export type EditReplyRequest = Request<{ userId: string; cheetId: string; replyId: string }, IReply, { text: string }>;

export type SendMessageRequest = Request<{ senderId: string; recipientId: string }, IMessage, { text: string }>;

export type EditMessageRequest = Request<
	{ senderId: string; recipientId: string; messageId: string },
	IMessage,
	{ text: string }
>;
