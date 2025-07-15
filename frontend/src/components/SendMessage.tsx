import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { IMessage } from "../interfaces/interfaces";
import axios from "axios";
import { serverURL } from "../config/config";
import IconButton from "@mui/material/IconButton/IconButton";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Send from "@mui/icons-material/Send";
import { Box, Grid2, TextField, ThemeProvider, Typography } from "@mui/material";
import theme from "../styles/theme";
import FlexBox from "../styles/FlexBox";
import { useError } from "../contexts/ErrorContext";
import { useAuth } from "../contexts/AuthContext";

interface Props {
	recipientId: string;
	isDisabled: boolean;
	toggleReloadTrigger: React.Dispatch<React.SetStateAction<boolean>>;
	setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>;
	setErrors: React.Dispatch<React.SetStateAction<string[]>>;
	triggerScroll: React.Dispatch<React.SetStateAction<boolean>>;
	setMessagesError: React.Dispatch<React.SetStateAction<string>>;
	userPageId?: string;
}

const SendMessage: React.FC<Props> = ({
	recipientId,
	isDisabled,
	toggleReloadTrigger,
	setMessages,
	triggerScroll,
	setMessagesError,
	userPageId,
}) => {
	const { register, handleSubmit, reset } = useForm<{ text: string }>();
	const [isSubmitLoading, setSubmitLoading] = useState<boolean>(false);

	const { handleErrors } = useError();
	const { setComponentLoading } = useAuth();

	const onSubmit: SubmitHandler<{ text: string }> = async (data) => {
		try {
			setSubmitLoading(true);
			setComponentLoading(true);
			reset();
			const newMessage = await axios.post<IMessage>(`${serverURL}/messages/${recipientId}`, data, {
				withCredentials: true,
			});
			setMessages((prevMessages) => [...prevMessages, newMessage.data]);
			triggerScroll((prev) => !prev);
			if (!userPageId) {
				toggleReloadTrigger((reloadTrigger) => !reloadTrigger);
			}

			setMessagesError("");
		} catch (error) {
			handleErrors(error, "sending message");
		} finally {
			setSubmitLoading(false);
			setComponentLoading(false);
		}
	};

	return (
		<ThemeProvider theme={theme}>
			<FlexBox>
				<Grid2
					container
					component="form"
					onSubmit={handleSubmit((data) => {
						if (isDisabled) {
							return;
						}
						onSubmit(data);
					})}
				>
					<Grid2 size={2} />
					<Grid2 container size={8}>
						<Grid2 size={12}>
							<Typography variant="subtitle1">Send a Message:</Typography>
						</Grid2>
						<Grid2 size={12}>
							<TextField {...register("text")} type="text" variant="standard" />
						</Grid2>
					</Grid2>
					<Grid2 size={2} container justifyContent="center">
						{isSubmitLoading ? (
							<Box paddingTop={3}>
								<CircularProgress size="2.1rem" thickness={6} />
							</Box>
						) : (
							<IconButton type="submit" sx={{ pointerEvents: isDisabled ? "none" : undefined }}>
								<Send fontSize="large" />
							</IconButton>
						)}
					</Grid2>
				</Grid2>
			</FlexBox>
		</ThemeProvider>
	);
};

export default SendMessage;
