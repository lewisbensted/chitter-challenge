import React, { useEffect, useState } from "react";
import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import ErrorModal from "../components/ErrorModal";
import Layout from "./Layout";
import { serverURL } from "../utils/serverURL";
import { handleErrors } from "../utils/handleErrors";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import FlexBox from "../styles/FlexBox";
import { Box, Button, Grid2, IconButton, TextField, ThemeProvider, Typography } from "@mui/material";
import theme from "../styles/theme";
import Login from "@mui/icons-material/Login";

interface LoginFormFields {
	username: string;
	password: string;
}

const SignIn: React.FC = () => {
	const { register, handleSubmit, reset } = useForm<LoginFormFields>();
	const navigate = useNavigate();

	const [isPageLoading, setPageLoading] = useState<boolean>(true);
	const [isFormLoading, setFormLoading] = useState<boolean>(false);
	const [userId, setUserId] = useState<string>();
	const [errors, setErrors] = useState<string[]>([]);

	console.log(serverURL)

	useEffect(() => {
		axios
			.get(`${serverURL}/validate`, { withCredentials: true })
			.then(() => {
				navigate("/");
			})
			.catch((error: unknown) => {
				if (axios.isAxiosError(error) && error.response?.status === 401) {
					setUserId(undefined);
				} else {
					handleErrors(error, "authenticating the user", setErrors);
				}
				setPageLoading(false);
			});
	}, [navigate]);

	const onSubmit: SubmitHandler<LoginFormFields> = (data) => {
		setFormLoading(true);
		reset();
		axios
			.post(`${serverURL}/login`, data, { withCredentials: true })
			.then(() => {
				navigate("/");
			})
			.catch((error: unknown) => {
				handleErrors(error, "logging in", setErrors);
				setFormLoading(false);
			});
	};

	return (
		<ThemeProvider theme={theme}>
			<Layout
				isPageLoading={isPageLoading}
				isComponentLoading={isFormLoading}
				setPageLoading={setPageLoading}
				userId={userId}
				setUserId={setUserId}
			>
				<Box>
					<ErrorModal
						errors={errors}
						closeModal={() => {
							setErrors([]);
						}}
					/>
					<Typography variant="h4">Sign In</Typography>
					{isPageLoading ? (
						<FlexBox>
							<CircularProgress thickness={5} />
						</FlexBox>
					) : (
						<Grid2 container component="form" onSubmit={handleSubmit(onSubmit)}>
							<Grid2 size={12} container display="block">
								<Typography variant="subtitle1">Username:</Typography>
								<TextField type="text" {...register("username")}></TextField>

								<Typography variant="subtitle1">Password:</Typography>
								<TextField type="text" {...register("password")}></TextField>
							</Grid2>
							<Grid2 size={12}>
								<FlexBox>
									<Button type="submit" disabled={!!userId} color="primary" variant="contained">
										<Typography variant="button" color="secondary">
											Sign in
										</Typography>
										<IconButton color="secondary">
											<Login />
										</IconButton>
									</Button>
								</FlexBox>
							</Grid2>
						</Grid2>
					)}
				</Box>
			</Layout>
		</ThemeProvider>
	);
};

export default SignIn;
