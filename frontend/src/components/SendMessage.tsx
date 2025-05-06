import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { IMessage } from "../interfaces/interfaces";
import axios from "axios";
import { serverURL } from "../config/config";
import { handleErrors } from "../utils/handleErrors";
import IconButton from "@mui/material/IconButton/IconButton";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Send from "@mui/icons-material/Send";
import { Box, Grid2, TextField, ThemeProvider, Typography } from "@mui/material";
import theme from "../styles/theme";
import FlexBox from "../styles/FlexBox";

interface Props {
	recipientId: string;
	isDisabled: boolean;
	setMessages: (arg: IMessage[]) => void;
	setErrors: (arg: string[]) => void;
	setComponentLoading: (arg: boolean) => void;
	setReloadWhenClosed?: (arg: boolean) => void;
	setScroll: (arg: boolean) => void;
}

const SendMessage: React.FC<Props> = ({
	recipientId,
	isDisabled,
	setMessages,
	setErrors,
	setComponentLoading,
	setReloadWhenClosed,
	setScroll,
}) => {
	const { register, handleSubmit, reset } = useForm<{ text: string }>();
	const [isSubmitLoading, setSubmitLoading] = useState<boolean>(false);

	const onSubmit: SubmitHandler<{ text: string }> = async (data) => {
		setSubmitLoading(true);
		setComponentLoading(true);
		reset();
		await axios
			.post(`${serverURL}/messages/${recipientId}`, data, {
				withCredentials: true,
			})
			.then((res: { data: IMessage[] }) => {
				setMessages(res.data);
				setScroll(true);
				if (setReloadWhenClosed) {
					setReloadWhenClosed(true);
				}
			})
			.catch((error: unknown) => {
				handleErrors(error, "sending message", setErrors);
			});
		setSubmitLoading(false);
		setComponentLoading(false);
	};

	return (
		<ThemeProvider theme={theme}>
			<FlexBox>
				<Grid2 container component="form" onSubmit={handleSubmit(onSubmit)}>
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
							<IconButton type="submit" disabled={isDisabled} color="primary">
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
