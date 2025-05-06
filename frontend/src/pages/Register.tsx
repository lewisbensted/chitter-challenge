import React, { Fragment, useEffect, useState } from "react";
import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";
import ErrorModal from "../components/ErrorModal";
import SuccessModal from "../components/SuccessModal";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import { serverURL } from "../config/config";
import { handleErrors } from "../utils/handleErrors";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import AppRegistration from "@mui/icons-material/AppRegistration";
import IconButton from "@mui/material/IconButton/IconButton";
import FlexBox from "../styles/FlexBox";
import { Box, Button, Grid2, TextField, ThemeProvider, Typography } from "@mui/material";
import theme from "../styles/theme";
import validateUser from "../utils/validateUser";
import useValidateUser from "../hooks/useValidateUser";

interface RegisterFormFields {
	firstName: string;
	lastName: string;
	username: string;
	password: string;
	email: string;
}

const Register: React.FC = () => {
	const { register, handleSubmit, reset } = useForm<RegisterFormFields>();

	const [isFormLoading, setFormLoading] = useState<boolean>(false);
	const [errors, setErrors] = useState<string[]>([]);
	const [isSuccessOpen, setSuccessOpen] = useState<boolean>(false);

	const { userId, isValidateLoading, setUserId, setValidateLoading, validateUser } = useValidateUser();

	useEffect(() => {
		void validateUser((error) => handleErrors(error, "fetching page information", setErrors), false, true);
	}, []);

	const onSubmit: SubmitHandler<RegisterFormFields> = async (data) => {
		setFormLoading(true);
		reset();
		try {
			await axios.post(`${serverURL}/register`, data);
			setSuccessOpen(true);
		} catch (error) {
			handleErrors(error, "registering the user", setErrors);
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
					<SuccessModal
						isOpen={isSuccessOpen}
						message="Account created."
						closeModal={() => {
							setSuccessOpen(false);
						}}
					/>
					{isValidateLoading ? (
						<FlexBox>
							<CircularProgress thickness={5} />
						</FlexBox>
					) : (
						<Fragment>
							<Typography variant="h4">Register</Typography>
							<Grid2 container component="form" onSubmit={handleSubmit(onSubmit)}>
								<Grid2 size={12} container display="block">
									<Typography variant="subtitle1">First Name:</Typography>
									<TextField type="text" {...register("firstName")}></TextField>
									<Typography variant="subtitle1">Last Name:</Typography>
									<TextField type="text" {...register("lastName")}></TextField>
									<Typography variant="subtitle1">Username:</Typography>
									<TextField type="text" {...register("username")}></TextField>
									<Typography variant="subtitle1">Password:</Typography>
									<TextField type="text" {...register("password")}></TextField>
									<Typography variant="subtitle1">E-mail:</Typography>
									<TextField type="text" {...register("email")}></TextField>
									{isFormLoading ? (
										<FlexBox>
											<CircularProgress thickness={5} />
										</FlexBox>
									) : (
										<FlexBox>
											<Button
												type="submit"
												disabled={!!userId}
												color="primary"
												variant="contained"
											>
												<Typography variant="button" color="inherit">
													Register
												</Typography>
												<IconButton color="inherit">
													<AppRegistration />
												</IconButton>
											</Button>
										</FlexBox>
									)}
								</Grid2>
							</Grid2>
						</Fragment>
					)}
				</Box>
			</Layout>
		</ThemeProvider>
	);
};

export default Register;
