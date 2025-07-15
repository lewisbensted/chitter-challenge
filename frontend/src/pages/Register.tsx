import React, { useEffect, useState } from "react";
import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";
import ErrorModal from "../components/ErrorModal";
import SuccessModal from "../components/SuccessModal";
import { serverURL } from "../config/config";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import AppRegistration from "@mui/icons-material/AppRegistration";
import FlexBox from "../styles/FlexBox";
import { Box, Button, Grid2, TextField, ThemeProvider, Typography } from "@mui/material";
import theme from "../styles/theme";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useError } from "../contexts/ErrorContext";

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
	const { errors, clearErrors, handleErrors } = useError();
	const [isSuccessOpen, setSuccessOpen] = useState<boolean>(false);
	const { userId, isValidateLoading, setComponentLoading } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (userId && !isValidateLoading) {
			void navigate("/");
		}
	}, [userId, isValidateLoading, navigate]);

	const onSubmit: SubmitHandler<RegisterFormFields> = async (data) => {
		setFormLoading(true);
		setComponentLoading(true);
		reset();
		try {
			await axios.post(`${serverURL}/register`, data);
			setSuccessOpen(true);
		} catch (error) {
			handleErrors(error, "registering the user");
		} finally {
			setFormLoading(false);
			setComponentLoading(false);
		}
	};

	return (
		<ThemeProvider theme={theme}>
			<Box>
				<ErrorModal errors={errors} closeModal={clearErrors} />
				<SuccessModal
					isOpen={isSuccessOpen}
					message="Account created."
					closeModal={() => {
						setSuccessOpen(false);
					}}
				/>

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
						<FlexBox>
							{isFormLoading ? (
								<CircularProgress size="2.1rem" thickness={6} />
							) : (
								<Button type="submit" disabled={!!userId} variant="contained">
									<Typography variant="button" color="inherit">
										Register
									</Typography>

									<AppRegistration />
								</Button>
							)}
						</FlexBox>
					</Grid2>
				</Grid2>
			</Box>
		</ThemeProvider>
	);
};

export default Register;
