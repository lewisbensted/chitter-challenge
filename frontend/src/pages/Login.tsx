import React, { Fragment, useEffect, useState } from "react";
import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import ErrorModal from "../components/ErrorModal";
import { serverURL } from "../config/config";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import FlexBox from "../styles/FlexBox";
import { Box, Button, Grid2, TextField, ThemeProvider, Typography } from "@mui/material";
import theme from "../styles/theme";
import Login from "@mui/icons-material/Login";
import { useAuth } from "../contexts/AuthContext";
import { useError } from "../contexts/ErrorContext";

interface LoginFormFields {
	username: string;
	password: string;
}

const SignIn: React.FC = () => {
	const { register, handleSubmit, reset } = useForm<LoginFormFields>();
	const navigate = useNavigate();
	const [isFormLoading, setFormLoading] = useState<boolean>(false);

	const { errors, clearErrors, handleErrors } = useError();

	const { userId, isValidateLoading, setUserId, setComponentLoading } = useAuth();

	useEffect(() => {
		if (userId && !isValidateLoading) {
			void navigate("/");
		}
	}, [userId, isValidateLoading, navigate]);

	const onSubmit: SubmitHandler<LoginFormFields> = async (data) => {
		setFormLoading(true);
		setComponentLoading(true);
		reset();
		try {
			const res = await axios.post<string>(`${serverURL}/login`, data, { withCredentials: true });
			setUserId(res.data);
			void navigate("/");
		} catch (error) {
			handleErrors(error, "logging in");
		} finally {
			setFormLoading(false);
			setComponentLoading(false);
		}
	};

	return (
		<ThemeProvider theme={theme}>
			<Box>
				<ErrorModal errors={errors} closeModal={clearErrors} />

				{isValidateLoading ? (
					<FlexBox>
						<CircularProgress thickness={5} />
					</FlexBox>
				) : (
					<Fragment>
						<Typography variant="h4">Sign In</Typography>
						<Grid2 container component="form" onSubmit={handleSubmit(onSubmit)}>
							<Grid2 size={12} container display="block">
								<Typography variant="subtitle1">Username:</Typography>
								<TextField type="text" {...register("username")}></TextField>

								<Typography variant="subtitle1">Password:</Typography>
								<TextField type="text" {...register("password")}></TextField>
							</Grid2>
							<Grid2 size={12}>
								<FlexBox>
									{isFormLoading ? (
										<CircularProgress size="2.1rem" thickness={6} />
									) : (
										<Button type="submit" disabled={!!userId} variant="contained">
											<Typography variant="button" color="inherit">
												Sign in
											</Typography>

											<Login />
										</Button>
									)}
								</FlexBox>
							</Grid2>
						</Grid2>
					</Fragment>
				)}
			</Box>
		</ThemeProvider>
	);
};

export default SignIn;
