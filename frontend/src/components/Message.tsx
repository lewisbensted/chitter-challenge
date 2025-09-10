import React, { forwardRef, useEffect } from "react";
import { useState } from "react";
import type { IMessage } from "../interfaces/interfaces";
import { SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { serverURL } from "../config/config";
import {
	Box,
	Card,
	CardActions,
	CardContent,
	CircularProgress,
	Grid2,
	IconButton,
	TextField,
	ThemeProvider,
	Typography,
} from "@mui/material";
import { Delete, Done, Edit } from "@mui/icons-material";
import theme from "../styles/theme";
import { formatDate } from "../utils/formatDate";
import { useError } from "../contexts/ErrorContext";
import { useAuth } from "../contexts/AuthContext";
import { useIsMounted } from "../utils/isMounted";
import { useLayout } from "../contexts/LayoutContext";

interface Props {
	message: IMessage;
	messages: IMessage[];
	setErrors: React.Dispatch<React.SetStateAction<string[]>>;
	setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>;
	isDisabled: boolean;
	toggleReloadTrigger: React.Dispatch<React.SetStateAction<boolean>>;
	userPageId?: string;
}

const Message = forwardRef<HTMLDivElement, Props>(
	({ message, messages, setMessages, isDisabled, toggleReloadTrigger, userPageId }, ref) => {
		const { register, handleSubmit, setValue } = useForm<{ text: string }>();
		const [isEditLoading, setEditLoading] = useState<boolean>(false);
		const [isDeleteLoading, setDeleteLoading] = useState<boolean>(false);
		const [isEditing, setEditing] = useState<boolean>(false);

		const { handleErrors } = useError();
		const { userId, setComponentLoading } = useAuth();

		const { openSnackbar } = useLayout();

		const isMounted = useIsMounted();

		useEffect(() => {
			if (isEditing && message.text) {
				setValue("text", message.text);
			}
		}, [isEditing, message.text, setValue]);

		const editMessage: SubmitHandler<{ text: string }> = async (data) => {
			try {
				setEditLoading(true);
				setComponentLoading(true);
				const updatedMessage = await axios.put<IMessage>(
					`${serverURL}/api/messages/${message.recipient.uuid}/message/${message.uuid}`,
					data,
					{
						withCredentials: true,
					}
				);

				setMessages((prevMessages) =>
					prevMessages.map((message) =>
						message.uuid === updatedMessage.data.uuid ? updatedMessage.data : message
					)
				);
			} catch (error) {
				if (isMounted.current) handleErrors(error, "editing message");
				else openSnackbar("Failed to edit message");
			} finally {
				setEditing(false);
				setEditLoading(false);
				setComponentLoading(false);
			}
		};

		const deleteMessage = async () => {
			try {
				setDeleteLoading(true);
				setComponentLoading(true);
				const deletedMessage = await axios.delete<IMessage>(
					`${serverURL}/api/messages/${message.recipient.uuid}/message/${message.uuid}`,
					{
						withCredentials: true,
					}
				);
				setMessages((prevMessages) =>
					prevMessages.map((message) =>
						message.uuid === deletedMessage.data.uuid ? deletedMessage.data : message
					)
				);
				if (isEditing) setEditing(false);
				const isLastMessage = messages[messages.length - 1].uuid === message.uuid;
				if (isLastMessage && !userPageId) {
					toggleReloadTrigger((prev) => !prev);
				}
			} catch (error) {
				if (isMounted.current) handleErrors(error, "deleting message");
				else openSnackbar("Failed to delete message");
			} finally {
				setDeleteLoading(false);
				setComponentLoading(false);
			}
		};

		const createdAt = new Date(message.createdAt);
		const updatedAt = new Date(message.updatedAt);
		const isEdited = updatedAt > createdAt;

		return (
			<ThemeProvider theme={theme}>
				<Card ref={ref}>
					<Grid2 container justifyContent={message.sender.uuid === userId ? "" : "flex-end"}>
						<Grid2 size={6}>
							<CardContent>
								<Grid2 container>
									<Grid2
										size={message.messageStatus.isRead && userId === message.sender.uuid ? 11 : 12}
									>
										{isEditing ? (
											<Box
												component="form"
												onSubmit={handleSubmit((data) => {
													if (isDisabled) {
														return;
													}
													editMessage(data);
												})}
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
											{isEditLoading ? (
												<Box paddingTop={1.3} paddingLeft={1.4}>
													<CircularProgress size="1.3rem" thickness={6} />
												</Box>
											) : (
												!message.messageStatus.isRead &&
												(isEditing ? (
													<IconButton
														type="submit"
														form={`edit-message-${message.uuid}`}
														key={`edit-message-${message.uuid}`}
														sx={{ pointerEvents: isDisabled ? "none" : undefined }}
													>
														<Done />
													</IconButton>
												) : (
													<IconButton
														onClick={() => {
															setEditing(true);
														}}
														sx={{ pointerEvents: isDisabled ? "none" : undefined }}
													>
														<Edit />
													</IconButton>
												))
											)}
										</Grid2>
										<Grid2 size={1}>
											{isDeleteLoading ? (
												<Box paddingTop={1.3} paddingLeft={1}>
													<CircularProgress size="1.3rem" thickness={6} />
												</Box>
											) : message.messageStatus.isRead ? null : (
												<IconButton
													onClick={deleteMessage}
													sx={{ pointerEvents: isDisabled ? "none" : undefined }}
												>
													<Delete />
												</IconButton>
											)}
										</Grid2>
									</Grid2>
								</CardActions>
							</Grid2>
						)}
					</Grid2>
				</Card>
			</ThemeProvider>
		);
	}
);

Message.displayName = "Message";

export default Message;
