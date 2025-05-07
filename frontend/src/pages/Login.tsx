import React, { Fragment, useEffect, useState } from "react";
import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import ErrorModal from "../components/ErrorModal";
import Layout from "./Layout";
import { serverURL } from "../config/config";
import { handleErrors } from "../utils/handleErrors";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import FlexBox from "../styles/FlexBox";
import { Box, Button, Grid2, IconButton, TextField, ThemeProvider, Typography } from "@mui/material";
import theme from "../styles/theme";
import Login from "@mui/icons-material/Login";
import useValidateUser from "../hooks/useValidateUser";

interface LoginFormFields {
	username: string;
	password: string;
}

const SignIn: React.FC = () => {
	const { register, handleSubmit, reset } = useForm<LoginFormFields>();
	const navigate = useNavigate();

	const [isFormLoading, setFormLoading] = useState<boolean>(false);

	const [errors, setErrors] = useState<string[]>([]);

	const { userId, isValidateLoading, setUserId, setValidateLoading, validateUser } = useValidateUser();

	useEffect(() => {
		void validateUser(
			(error) => {
				handleErrors(error, "fetching page information", setErrors);
			},
			{ isLoggedIn: true }
		);
	}, [validateUser]);

	const onSubmit: SubmitHandler<LoginFormFields> = async (data) => {
		setFormLoading(true);
		reset();
		try {
			await axios.post(`${serverURL}/login`, data, { withCredentials: true });
			navigate("/");
		} catch (error) {
			handleErrors(error, "logging in", setErrors);
		} finally {
			setFormLoading(false);
		}
	};

	return (
		<ThemeProvider theme={theme}>
			<Layout
				isValidationLoding={isValidateLoading}
				isComponentLoading={isFormLoading}
				setPageLoading={setValidateLoading}
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
										<Button type="submit" disabled={!!userId} color="primary" variant="contained">
											<Typography variant="button" color="inherit">
												Sign in
											</Typography>
											<IconButton color="inherit">
												<Login />
											</IconButton>
										</Button>
									</FlexBox>
								</Grid2>
							</Grid2>
						</Fragment>
					)}
				</Box>
			</Layout>
		</ThemeProvider>
	);
};

export default SignIn;
