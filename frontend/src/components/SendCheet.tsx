import React, { useState } from "react";
import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";
import { ICheet } from "../interfaces/interfaces";
import { useParams } from "react-router-dom";
import { serverURL } from "../config/config";
import IconButton from "@mui/material/IconButton/IconButton";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Send from "@mui/icons-material/Send";
import FlexBox from "../styles/FlexBox";
import { Box, Grid2, TextField, ThemeProvider, Typography } from "@mui/material";
import theme from "../styles/theme";
import { useError } from "../contexts/ErrorContext";
import { useAuth } from "../contexts/AuthContext";

interface Props {
	isDisabled: boolean;
	setCheets: React.Dispatch<React.SetStateAction<ICheet[]>>;
	setCheetsError: React.Dispatch<React.SetStateAction<string>>;
	setErrors: React.Dispatch<React.SetStateAction<string[]>>;
	triggerScroll: React.Dispatch<React.SetStateAction<boolean>>;
}

const SendCheet: React.FC<Props> = ({
	isDisabled,
	setCheets,
	setCheetsError,
	triggerScroll,
}) => {
	const { id } = useParams();
	const { register, handleSubmit, reset } = useForm<{ text: string }>();
	const [isSubmitLoading, setSubmitLoading] = useState<boolean>(false);

	const { handleErrors } = useError();
	const { setComponentLoading } = useAuth();

	const onSubmit: SubmitHandler<{ text: string }> = async (data) => {
		try {
			setSubmitLoading(true);
			setComponentLoading(true);
			reset();
			const newCheet = await axios.post<ICheet>(`${serverURL + (id ? `/users/${id}` : "")}/cheets`, data, {
				withCredentials: true,
			});
			setCheets((prevCheets) => [newCheet.data, ...prevCheets]);

			triggerScroll((prev) => !prev);
			setCheetsError("");
		} catch (error) {
			handleErrors(error, "sending cheet");
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
							<Typography variant="subtitle1">Send a Cheet:</Typography>
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

export default SendCheet;
