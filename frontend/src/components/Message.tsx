import React from "react";
import { useState } from "react";
import { IMessage } from "../interfaces/interfaces";
import { SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { serverURL } from "../config/config";
import { handleErrors } from "../utils/handleErrors";
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

interface Props {
	userId?: string | null;
	message: IMessage;
	messages: IMessage[];
	setErrors: React.Dispatch<React.SetStateAction<string[]>>;
	setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>;
	isComponentLoading: boolean;
	setComponentLoading: React.Dispatch<React.SetStateAction<boolean>>;
	toggleReloadTrigger: React.Dispatch<React.SetStateAction<boolean>>;
}

const Message: React.FC<Props> = ({
	userId,
	message,
	messages,
	setErrors,
	setMessages,
	isComponentLoading,
	setComponentLoading,
	toggleReloadTrigger,
}) => {
	const { register, handleSubmit } = useForm<{ text: string }>();
	const [isEditLoading, setEditLoading] = useState<boolean>(false);
	const [isDeleteLoading, setDeleteLoading] = useState<boolean>(false);
	const [isEditing, setEditing] = useState<boolean>(false);

	const editMessage: SubmitHandler<{ text: string }> = async (data) => {
		try {
			setEditLoading(true);
			setComponentLoading(true);
			const updatedMessage = await axios.put<IMessage>(
				`${serverURL}/messages/${message.recipient.uuid}/message/${message.uuid}`,
				data,
				{
					withCredentials: true,
				}
			);

			const updatedMessages = messages.map((message) =>
				message.uuid === updatedMessage.data.uuid ? updatedMessage.data : message
			);
			setMessages(updatedMessages);
		} catch (error) {
			handleErrors(error, "editing the message", setErrors);
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
				`${serverURL}/messages/${message.recipient.uuid}/message/${message.uuid}`,
				{
					withCredentials: true,
				}
			);
			const updatedMessages = messages.map((message) =>
				message.uuid === deletedMessage.data.uuid ? deletedMessage.data : message
			);

			setMessages(updatedMessages);
			toggleReloadTrigger((reloadTrigger) => !reloadTrigger);
		} catch (error) {
			handleErrors(error, "deleting the message", setErrors);
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
			<Card>
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
												defaultValue={message.text}
												variant="standard"
											/>
										</Box>
									) : (
										<Typography
											justifyContent={message.sender.uuid === userId ? "" : "flex-end"}
											textAlign={message.sender.uuid === userId ? "left" : "right"}
											fontWeight={
												!message.messageStatus.isRead && message.recipient.uuid === userId ? "bold" : ""
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
								{message.sender.uuid === userId && message.messageStatus.isRead ? (
									<Grid2 size={1} display="flex" justifyContent="center">
										<Done fontSize="small" color="primary" />
									</Grid2>
								) : null}
								<Grid2 size={12}>
									<Typography
										variant="body2"
										justifyContent={message.sender.uuid === userId ? "" : "flex-end"}
										textAlign={message.sender.uuid === userId ? "left" : "right"}
									>
										{isEdited && !message.messageStatus.isDeleted ? (
											<Edit fontSize="small" color="primary" />
										) : null}
										{formatDate(isEdited ? updatedAt : createdAt)}
									</Typography>
								</Grid2>
							</Grid2>
						</CardContent>
					</Grid2>

					{message.sender.uuid === userId && !message.messageStatus.isDeleted ? (
						<Grid2 size={1.5} container>
							<CardActions>
								<Grid2 container size={12} columns={2}>
									<Grid2 size={1}>
										{isEditLoading ? (
											<Box paddingTop={1.3} paddingLeft={1.4}>
												<CircularProgress size="1.3rem" thickness={6} />
											</Box>
										) : message.messageStatus.isRead ? null : isEditing ? (
											<IconButton
												type="submit"
												disabled={isComponentLoading}
												form={`edit-message-${message.uuid}`}
												key={`edit-message-${message.uuid}`}
												color="primary"
											>
												<Done />
											</IconButton>
										) : (
											<IconButton
												onClick={() => {
													setEditing(true);
												}}
												color="primary"
											>
												<Edit />
											</IconButton>
										)}
									</Grid2>
									<Grid2 size={1}>
										{isDeleteLoading ? (
											<Box paddingTop={1.3} paddingLeft={1}>
												<CircularProgress size="1.3rem" thickness={6} />
											</Box>
										) : message.messageStatus.isRead ? null : (
											<IconButton
												color="primary"
												disabled={isComponentLoading}
												onClick={deleteMessage}
											>
												<Delete />
											</IconButton>
										)}
									</Grid2>
								</Grid2>
							</CardActions>
						</Grid2>
					) : null}
				</Grid2>
			</Card>
		</ThemeProvider>
	);
};

export default Message;
