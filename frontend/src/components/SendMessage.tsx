import React, { useCallback, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import type { IConversation, IMessage } from "../interfaces/interfaces";
import axios from "axios";
import { serverURL } from "../config/config";
import IconButton from "@mui/material/IconButton/IconButton";
import Send from "@mui/icons-material/Send";
import { Grid2, TextField } from "@mui/material";
import FlexBox from "../styles/FlexBox";
import { useError } from "../contexts/ErrorContext";
import LoadingSpinner from "./LoadingSpinner";
import { throwApiError } from "../utils/apiResponseError";

interface Props {
	recipientId: string;
	setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>;
	triggerScroll: React.Dispatch<React.SetStateAction<boolean>>;
	setMessagesError: React.Dispatch<React.SetStateAction<boolean>>;
	convosPage?: boolean;
	isModalMounted: React.MutableRefObject<boolean>;
	setConversations: React.Dispatch<React.SetStateAction<Map<string, IConversation>>>;
}

const SendMessage: React.FC<Props> = ({
	recipientId,
	setMessages,
	triggerScroll,
	setMessagesError,
	convosPage,
	isModalMounted,
	setConversations,
}) => {
	const { register, handleSubmit, reset } = useForm<{ text: string }>();
	const [isLoading, setSubmitLoading] = useState<boolean>(false);

	const { handleErrors } = useError();

	const [pendingMessage, setPendingMessage] = useState<IMessage | null>(null);
	const [pendingError, setPendingError] = useState<unknown>(null);

	const sendMessage: SubmitHandler<{ text: string }> = async (data) => {
		setSubmitLoading(true);
		try {
			const res = await axios.post<IMessage>(`${serverURL}/api/messages/${recipientId}`, data, {
				withCredentials: true,
			});
			const newMessage = res.data;
			if (typeof newMessage !== "object") throwApiError("object", newMessage);
			if (isModalMounted.current) setPendingMessage(newMessage);
		} catch (error) {
			if (isModalMounted.current) setPendingError(error);
			else handleErrors(error, "send message", false);
		} finally {
			if (isModalMounted.current) setSubmitLoading(false);
		}
	};

	const applyPending = useCallback(() => {
		if (pendingMessage) {
			if (isModalMounted.current) {
				setMessages((prevMessages) => [...prevMessages, pendingMessage]);
				setPendingMessage(null);
				triggerScroll((prev) => !prev);
				setMessagesError(false);
				reset();
			}
			if (convosPage) {
				setConversations((prevConvos) => {
					const newConvos = new Map(
						Array.from(prevConvos.values())
							.map((convo) =>
								convo.interlocutorId === recipientId
									? { ...convo, latestMessage: pendingMessage }
									: convo
							)
							.sort((a, b) => {
								const aTime = new Date(a.latestMessage?.createdAt ?? 0).getTime();
								const bTime = new Date(b.latestMessage?.createdAt ?? 0).getTime();
								return bTime - aTime;
							})
							.map((convo) => [convo.interlocutorId, convo])
					);
					return newConvos;
				});
			}
		}
		if (pendingError) {
			handleErrors(pendingError, "send message", isModalMounted.current);
			if (isModalMounted.current) setPendingError(null);
		}
	}, [
		convosPage,
		handleErrors,
		isModalMounted,
		pendingError,
		pendingMessage,
		recipientId,
		reset,
		setConversations,
		setMessages,
		setMessagesError,
		triggerScroll,
	]);

	return (
		<FlexBox>
			<Grid2 container component="form" onSubmit={handleSubmit(sendMessage)} width={350}>
				<Grid2 container size={11} paddingRight={2}>
					<TextField {...register("text")} type="text" variant="standard" label="Send message" />
				</Grid2>
				<Grid2 size={1} container justifyContent="center">
					<LoadingSpinner onFinished={applyPending} isLoading={isLoading}>
						<IconButton type="submit" sx={{ pointerEvents: isLoading ? "none" : undefined }}>
							<Send fontSize="large" />
						</IconButton>
					</LoadingSpinner>
				</Grid2>
			</Grid2>
		</FlexBox>
	);
};

export default SendMessage;
