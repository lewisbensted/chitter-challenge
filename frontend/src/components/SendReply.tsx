import React, { useState } from "react";
import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";
import { IReply } from "../interfaces/interfaces";
import { serverURL } from "../config/config";
import { handleErrors } from "../utils/handleErrors";
import IconButton from "@mui/material/IconButton/IconButton";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Reply from "@mui/icons-material/Reply";
import { Box, Grid2, TextField, ThemeProvider, Typography } from "@mui/material";
import theme from "../styles/theme";
import FlexBox from "../styles/FlexBox";

interface Props {
	cheetId: string;
	isDisabled: boolean;
	setReplies: React.Dispatch<React.SetStateAction<IReply[]>>
	setErrors: React.Dispatch<React.SetStateAction<string[]>>
	setComponentLoading: React.Dispatch<React.SetStateAction<boolean>>;
	triggerScroll: React.Dispatch<React.SetStateAction<boolean>>;
	repliesLengthRef: React.MutableRefObject<number>;
	reloadTrigger: boolean;
	toggleReloadTrigger: React.Dispatch<React.SetStateAction<boolean>>;
	setRepliesError: React.Dispatch<React.SetStateAction<string>>;
}

const SendReply: React.FC<Props> = ({
	cheetId,
	isDisabled,
	setReplies,
	setErrors,
	setComponentLoading,
	triggerScroll,
	repliesLengthRef,
	toggleReloadTrigger,
	setRepliesError,
}) => {
	const { register, handleSubmit, reset } = useForm<{ text: string }>();
	const [isSubmitLoading, setSubmitLoading] = useState<boolean>(false);

	const onSubmit: SubmitHandler<{ text: string }> = async (data) => {
		try {
			setSubmitLoading(true);
			setComponentLoading(true);
			reset();
			const newReply = await axios.post<IReply>(
				`${serverURL}/cheets/${cheetId}/replies`,
				data,
				{
					withCredentials: true,
				}
			);
			
			setReplies((replies) => [newReply.data, ...replies]);
			triggerScroll((prev) => !prev);
			if (repliesLengthRef.current === 0) {
				toggleReloadTrigger((reloadTrigger) => !reloadTrigger);
			}
			repliesLengthRef.current++;
			setRepliesError("");
		} catch (error) {
			handleErrors(error, "sending the reply", setErrors);
		} finally {
			setSubmitLoading(false);
			setComponentLoading(false);
		}
	};
	return (
		<ThemeProvider theme={theme}>
			<FlexBox>
				<Grid2 container component="form" onSubmit={handleSubmit(onSubmit)}>
					<Grid2 size={2} />
					<Grid2 container size={8}>
						<Grid2 size={12}>
							<Typography variant="subtitle1">Send a Reply:</Typography>
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
								<Reply fontSize="large" />
							</IconButton>
						)}
					</Grid2>
				</Grid2>
			</FlexBox>
		</ThemeProvider>
	);
};

export default SendReply;
