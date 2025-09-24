import React, { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import type { IMessage } from "../interfaces/interfaces";
import axios from "axios";
import { serverURL } from "../config/config";
import IconButton from "@mui/material/IconButton/IconButton";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Send from "@mui/icons-material/Send";
import { Box, Grid2, TextField, Typography } from "@mui/material";
import FlexBox from "../styles/FlexBox";
import { useError } from "../contexts/ErrorContext";
import { useIsMounted } from "../utils/isMounted";

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
	const [isSubmitLoading, setSubmitLoading] = useState<boolean>(false);

	const { handleErrors } = useError();

	const isMounted = useIsMounted();

	const sendMessage: SubmitHandler<{ text: string }> = async (data) => {
		try {
			setSubmitLoading(true);
			const newMessage = await axios.post<IMessage>(`${serverURL}/api/messages/${recipientId}`, data, {
				withCredentials: true,
			});
			setMessages((prevMessages) => [...prevMessages, newMessage.data]);
			triggerScroll((prev) => !prev);
			if (convosPage) {
				toggleReloadTrigger((reloadTrigger) => !reloadTrigger);
			}
			setMessagesError("");
			reset();
		} catch (error) {
			handleErrors(error, "send message", isMounted.current);
		} finally {
			setSubmitLoading(false);
		}
	};

	return (
		<FlexBox>
			<Grid2 container component="form" onSubmit={handleSubmit(sendMessage)}>
				<Grid2 size={2} />
				<Grid2 container size={8}>
					<Grid2 size={12}>
						<TextField {...register("text")} type="text" variant="standard" label="Send message" />
					</Grid2>
				</Grid2>
				<Grid2 size={2} container justifyContent="center">
					{isSubmitLoading ? (
						<Box paddingTop={3}>
							<CircularProgress size="2.1rem" thickness={6} />
						</Box>
					) : (
						<IconButton type="submit">
							<Send fontSize="large" />
						</IconButton>
					)}
				</Grid2>
			</Grid2>
		</FlexBox>
	);
};

export default SendMessage;
