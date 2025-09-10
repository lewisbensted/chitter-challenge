import React, { useState } from "react";
import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";
import type { ICheet, IReply } from "../interfaces/interfaces";
import { serverURL } from "../config/config";
import IconButton from "@mui/material/IconButton/IconButton";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Reply from "@mui/icons-material/Reply";
import { Box, Grid2, TextField, ThemeProvider, Typography } from "@mui/material";
import theme from "../styles/theme";
import FlexBox from "../styles/FlexBox";
import { useError } from "../contexts/ErrorContext";
import { useAuth } from "../contexts/AuthContext";
import { useLayout } from "../contexts/LayoutContext";
import { useIsMounted } from "../utils/isMounted";

interface Props {
	selectedCheet: ICheet;
	isDisabled: boolean;
	setReplies: React.Dispatch<React.SetStateAction<IReply[]>>;
	setErrors: React.Dispatch<React.SetStateAction<string[]>>;
	triggerScroll: React.Dispatch<React.SetStateAction<boolean>>;
	repliesLengthRef: React.MutableRefObject<number>;
	setRepliesError: React.Dispatch<React.SetStateAction<string>>;
	setSelectedCheet: React.Dispatch<React.SetStateAction<ICheet | null | undefined>>;
	setCheets: React.Dispatch<React.SetStateAction<ICheet[]>>;
}

const SendReply: React.FC<Props> = ({
	selectedCheet,
	isDisabled,
	setReplies,
	triggerScroll,
	repliesLengthRef,
	setRepliesError,
	setSelectedCheet,
	setCheets,
}) => {
	const { register, handleSubmit, reset } = useForm<{ text: string }>();
	const [isSubmitLoading, setSubmitLoading] = useState<boolean>(false);

	const { handleErrors } = useError();
	const { setComponentLoading } = useAuth();
	const { openSnackbar } = useLayout();

	const isMounted = useIsMounted();

	const onSubmit: SubmitHandler<{ text: string }> = async (data) => {
		try {
			setSubmitLoading(true);
			setComponentLoading(true);
			const newReply = await axios.post<IReply>(`${serverURL}/api/cheets/${selectedCheet.uuid}/replies`, data, {
				withCredentials: true,
			});

			setReplies((replies) => [newReply.data, ...replies]);
			triggerScroll((prev) => !prev);
			if (repliesLengthRef.current === 0) {
				setSelectedCheet((cheet) => {
					if (!cheet) return cheet;
					return { ...cheet, cheetStatus: { hasReplies: true } };
				});

				setCheets((prevCheets) => {
					const updatedCheets = prevCheets.map((cheet) =>
						cheet.uuid === selectedCheet.uuid ? { ...cheet, cheetStatus: { hasReplies: true } } : cheet
					);
					return updatedCheets;
				});
			}
			repliesLengthRef.current++;
			setRepliesError("");
			reset();
		} catch (error) {
			if (isMounted.current) handleErrors(error, "sending the reply");
			else openSnackbar("Failed to send reply");
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
							<IconButton type="submit" sx={{ pointerEvents: isDisabled ? "none" : undefined }}>
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
