import React, { forwardRef, useEffect } from "react";
import { useState } from "react";
import type { IMessage } from "../interfaces/interfaces";
import { type SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { serverURL } from "../config/config";
import {
	Box,
	Card,
	CardActions,
	CardContent,
	Grid2,
	IconButton,
	TextField,
	Typography,
} from "@mui/material";
import { Delete, Done, Edit } from "@mui/icons-material";
import { formatDate } from "../utils/formatDate";
import { useError } from "../contexts/ErrorContext";
import { useAuth } from "../contexts/AuthContext";
import { useIsMounted } from "../utils/isMounted";
import LoadingSpinner from "./LoadingSpinner";

interface Props {
	message: IMessage;
	messages: IMessage[];
	setErrors: React.Dispatch<React.SetStateAction<string[]>>;
	setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>;
	toggleReloadTrigger: React.Dispatch<React.SetStateAction<boolean>>;
	userPageId?: string;
}

const Message = forwardRef<HTMLDivElement, Props>(
	({ message, messages, setMessages, toggleReloadTrigger, userPageId }, ref) => {
		const { register, handleSubmit, setValue } = useForm<{ text: string }>();
		const [isEditLoading, setEditLoading] = useState<boolean>(false);
		const [isDeleteLoading, setDeleteLoading] = useState<boolean>(false);
		const [isEditing, setEditing] = useState<boolean>(false);

		const { handleErrors } = useError();
		const { userId } = useAuth();

		const isMounted = useIsMounted();

		useEffect(() => {
			if (isEditing && message.text) {
				setValue("text", message.text);
			}
		}, [isEditing, message.text, setValue]);

		const [pendingMessage, setPendingMessage] = useState<IMessage | null>(null);
		const [pendingError, setPendingError] = useState<unknown>(null);

		const editMessage: SubmitHandler<{ text: string }> = async (data) => {
			try {
				setEditLoading(true);
				const updatedMessage = await axios.put<IMessage>(
					`${serverURL}/api/messages/${message.recipient.uuid}/message/${message.uuid}`,
					data,
					{
						withCredentials: true,
					}
				);
				setPendingMessage(updatedMessage.data);
			} catch (error) {
				setPendingError(error);
			} finally {
				setEditing(false);
				setEditLoading(false);
			}
		};

		const applyPendingEdit = () => {
			if (pendingMessage) {
				setMessages((prevMessages) =>
					prevMessages.map((message) => (message.uuid === pendingMessage.uuid ? pendingMessage : message))
				);
				setPendingMessage(null);
			}
			if (pendingError) {
				handleErrors(pendingError, "edit message");
				setPendingError(null);
			}
		};

		const deleteMessage = async () => {
			try {
				setDeleteLoading(true);
				const deletedMessage = await axios.delete<IMessage>(
					`${serverURL}/api/messages/${message.recipient.uuid}/message/${message.uuid}`,
					{
						withCredentials: true,
					}
				);
				setPendingMessage(deletedMessage.data);
			} catch (error) {
				setPendingError(error);
			} finally {
				setDeleteLoading(false);
			}
		};

		const applyPendingDelete = () => {
			if (pendingMessage) {
				setMessages((prevMessages) =>
					prevMessages.map((message) => (message.uuid === pendingMessage.uuid ? pendingMessage : message))
				);
				if (isEditing) setEditing(false);
				const isLastMessage = messages[messages.length - 1].uuid === message.uuid;
				if (isLastMessage && !userPageId) {
					toggleReloadTrigger((prev) => !prev);
				}
				setPendingMessage(null);
			}
			if (pendingError) {
				handleErrors(pendingError, "delete message");
				setPendingError(null);
			}
		};

		const createdAt = new Date(message.createdAt);
		const updatedAt = new Date(message.updatedAt);
		const isEdited = updatedAt > createdAt;
		const isLoading= isEditLoading || isDeleteLoading;

		return (
			<Card ref={ref}>
				<Grid2 container justifyContent={message.sender.uuid === userId ? "" : "flex-end"}>
					<Grid2 size={6}>
						<CardContent>
							<Grid2 container>
								<Grid2 size={message.messageStatus.isRead && userId === message.sender.uuid ? 11 : 12}>
									{isEditing ? (
										<Box
											component="form"
											onSubmit={handleSubmit(editMessage)}
											id={`edit-message-${message.uuid}`}
										>
											<TextField
												component="form"
												id="edit-message"
												{...register("text")}
												type="text"
												variant="standard"
											/>
										</Box>
									) : (
										<Typography
											justifyContent={message.sender.uuid === userId ? "" : "flex-end"}
											textAlign={message.sender.uuid === userId ? "left" : "right"}
											fontWeight={
												!message.messageStatus.isRead &&
												message.recipient.uuid === userId &&
												!message.messageStatus.isDeleted
													? "bold"
													: ""
											}
											fontStyle={message.messageStatus.isDeleted ? "italic" : "none"}
										>
											{message.messageStatus.isDeleted
												? message.sender.uuid === userId
													? "You deleted this message."
													: `${message.sender.username} deleted this message.`
												: message.text}
										</Typography>
									)}
								</Grid2>
								{message.sender.uuid === userId && message.messageStatus.isRead && (
									<Grid2 size={1} display="flex" justifyContent="center">
										<Done fontSize="small" color="primary" />
									</Grid2>
								)}
								<Grid2 size={12}>
									<Typography
										variant="body2"
										justifyContent={message.sender.uuid === userId ? "" : "flex-end"}
										textAlign={message.sender.uuid === userId ? "left" : "right"}
									>
										{isEdited && !message.messageStatus.isDeleted && (
											<Edit fontSize="small" color="primary" />
										)}
										{formatDate(isEdited ? updatedAt : createdAt)}
									</Typography>
								</Grid2>
							</Grid2>
						</CardContent>
					</Grid2>

					{message.sender.uuid === userId && !message.messageStatus.isDeleted && (
						<Grid2 size={1.5} container>
							<CardActions>
								<Grid2 container size={12} columns={2}>
									<Grid2 size={1}>
										<LoadingSpinner
											isLoading={isEditLoading}
											isLarge={false}
											onFinished={applyPendingEdit}
										>
											{!message.messageStatus.isRead &&
												(isEditing ? (
													<IconButton
														type="submit"
														form={`edit-message-${message.uuid}`}
														key={`edit-message-${message.uuid}`}
														sx={{ pointerEvents: isLoading ? "none" : undefined }}
													>
														<Done />
													</IconButton>
												) : (
													<IconButton
														onClick={() => {
															setEditing(true);
														}}
														sx={{ pointerEvents: isLoading ? "none" : undefined }}
													>
														<Edit />
													</IconButton>
												))}
										</LoadingSpinner>
									</Grid2>
									<Grid2 size={1}>
										<LoadingSpinner
											isLoading={isDeleteLoading}
											isLarge={false}
											onFinished={applyPendingDelete}
										>
											{message.messageStatus.isRead ? null : (
												<IconButton
													onClick={deleteMessage}
													sx={{ pointerEvents: isLoading ? "none" : undefined }}
												>
													<Delete />
												</IconButton>
											)}
										</LoadingSpinner>
									</Grid2>
								</Grid2>
							</CardActions>
						</Grid2>
					)}
				</Grid2>
			</Card>
		);
	}
);

Message.displayName = "Message";

export default Message;
