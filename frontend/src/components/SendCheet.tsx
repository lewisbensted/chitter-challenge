import React, { useState } from "react";
import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";
import { ICheet } from "../interfaces/interfaces";
import { useParams } from "react-router-dom";
import { serverURL } from "../config/config";
import { handleErrors } from "../utils/handleErrors";
import IconButton from "@mui/material/IconButton/IconButton";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Send from "@mui/icons-material/Send";
import FlexBox from "../styles/FlexBox";
import { Box, Grid2, TextField, ThemeProvider, Typography } from "@mui/material";
import theme from "../styles/theme";

interface Props {
	isDisabled: boolean;
	setCheets: React.Dispatch<React.SetStateAction<ICheet[]>>;
	setCheetsError: React.Dispatch<React.SetStateAction<string>>;
	setErrors: React.Dispatch<React.SetStateAction<string[]>>;
	setComponentLoading: React.Dispatch<React.SetStateAction<boolean>>;
	triggerScroll: React.Dispatch<React.SetStateAction<boolean>>;
	cheetsLengthRef: React.MutableRefObject<number>;
}

const SendCheet: React.FC<Props> = ({
	isDisabled,
	setCheets,
	setCheetsError,
	setErrors,
	setComponentLoading,
	triggerScroll,
	cheetsLengthRef,
}) => {
	const { id } = useParams();
	const { register, handleSubmit, reset } = useForm<{ text: string }>();
	const [isSubmitLoading, setSubmitLoading] = useState<boolean>(false);

	const onSubmit: SubmitHandler<{ text: string }> = async (data) => {
		try {
			setSubmitLoading(true);
			setComponentLoading(true);
			reset();
			const newCheet = await axios.post<ICheet>(`${serverURL + (id ? `/users/${id}` : "")}/cheets`, data, {
				withCredentials: true,
			});
			setCheets((cheets) => [newCheet.data, ...cheets]);
			cheetsLengthRef.current++;
			triggerScroll((prev) => !prev);
			setCheetsError("");
		} catch (error) {
			handleErrors(error, "sending cheet", setErrors);
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

export default SendCheet;
