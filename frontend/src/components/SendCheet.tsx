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
	setCheets: (arg: ICheet[]) => void;
	setCheetsError: (arg: string) => void;
	setErrors: (arg: string[]) => void;
	setComponentLoading: (arg: boolean) => void;
	setScroll: (arg: boolean) => void;
	cheetsLengthRef: React.MutableRefObject<number>;
}

const SendCheet: React.FC<Props> = ({
	isDisabled,
	setCheets,
	setCheetsError,
	setErrors,
	setComponentLoading,
	setScroll,
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
			const cheets = await axios.post<ICheet[]>(
				`${serverURL + (id ? `/users/${id}` : "")}/cheets?take=${cheetsLengthRef.current + 1}`,
				data,
				{
					withCredentials: true,
				}
			);
			setCheets(cheets.data);
			cheetsLengthRef.current++;
			setScroll(true);
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
