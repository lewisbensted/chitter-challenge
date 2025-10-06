import React, { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import type { IMessage } from "../interfaces/interfaces";
import axios from "axios";
import { serverURL } from "../config/config";
import IconButton from "@mui/material/IconButton/IconButton";
import Send from "@mui/icons-material/Send";
import { Grid2, TextField } from "@mui/material";
import FlexBox from "../styles/FlexBox";
import { useError } from "../contexts/ErrorContext";
import { useIsMounted } from "../utils/isMounted";
import LoadingSpinner from "./LoadingSpinner";

interface Props {
	recipientId: string;
	toggleReloadTrigger: React.Dispatch<React.SetStateAction<boolean>>;
	setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>;
	setErrors: React.Dispatch<React.SetStateAction<string[]>>;
	triggerScroll: React.Dispatch<React.SetStateAction<boolean>>;
	setMessagesError: React.Dispatch<React.SetStateAction<string>>;
	userPageId?: string;
	convosPage?: boolean;
}

const SendMessage: React.FC<Props> = ({
	recipientId,
	toggleReloadTrigger,
	setMessages,
	triggerScroll,
	setMessagesError,
	convosPage,
}) => {
	const { register, handleSubmit, reset } = useForm<{ text: string }>();
	const [isLoading, setSubmitLoading] = useState<boolean>(false);

	const { handleErrors } = useError();

	const isMounted = useIsMounted();

	const [pendingMessage, setPendingMessage] = useState<IMessage | null>(null);
	const [pendingError, setPendingError] = useState<unknown>(null);
	const sendMessage: SubmitHandler<{ text: string }> = async (data) => {
		try {
			setSubmitLoading(true);
			const newMessage = await axios.post<IMessage>(`${serverURL}/api/messages/${recipientId}`, data, {
				withCredentials: true,
			});
			setPendingMessage(newMessage.data);
		} catch (error) {
			setPendingError(error);
		} finally {
			setSubmitLoading(false);
		}
	};

	const applyPending = () => {
		if (pendingMessage) {
			setMessages((prevMessages) => [...prevMessages, pendingMessage]);
			setPendingMessage(null);
			triggerScroll((prev) => !prev);
			if (convosPage) {
				toggleReloadTrigger((reloadTrigger) => !reloadTrigger);
			}
			setMessagesError("");
			reset();
		}
		if (pendingError) {
			handleErrors(pendingError, "send message");
			setPendingError(null);
		}
	};

	return (
		<FlexBox>
			<Grid2
				container
				component="form"
				onSubmit={handleSubmit(sendMessage)}
				display={"flex"}
				justifyContent={"center"}
				width={350}
			>
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
