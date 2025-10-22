import React, { useCallback, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import type { IMessage } from "../interfaces/interfaces";
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
	refreshConversations: (
		interlocutorId: string,
		additionalParams?: {
			sort?: boolean | undefined;
			unread?: boolean | undefined;
			latestMessage?: IMessage | undefined;
		}
	) => void;
}

const SendMessage: React.FC<Props> = ({
	recipientId,
	setMessages,
	triggerScroll,
	setMessagesError,
	convosPage,
	isModalMounted,
	refreshConversations,
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
				refreshConversations(recipientId, { sort: true, latestMessage: pendingMessage });
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
		setMessages,
		setMessagesError,
		triggerScroll,
		refreshConversations
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
