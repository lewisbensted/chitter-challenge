import React, { useEffect, useState } from "react";
import axios from "axios";
import { type SubmitHandler, useForm } from "react-hook-form";
import { serverURL } from "../config/config";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import AppRegistration from "@mui/icons-material/AppRegistration";
import FlexBox from "../styles/FlexBox";
import { Box, Button, Grid2, TextField, Typography } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useError } from "../contexts/ErrorContext";
import toast from "react-hot-toast";
import { SPINNER_DURATION } from "../config/layout";

interface RegisterFormFields {
	firstName: string;
	lastName: string;
	username: string;
	password: string;
	email: string;
}

const Register: React.FC = () => {
	const { register, handleSubmit } = useForm<RegisterFormFields>();

	const [isFormLoading, setFormLoading] = useState<boolean>(false);
	const { handleErrors } = useError();
	const { userId, isValidateLoading } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (userId && !isValidateLoading) {
			void navigate("/");
		}
	}, [userId, isValidateLoading, navigate]);

	const onSubmit: SubmitHandler<RegisterFormFields> = async (data) => {
		setFormLoading(true);
		try {
			await axios.post(`${serverURL}/api/register`, data);
			setTimeout(() => {
				toast("Account created");
				void navigate("/login");
			}, SPINNER_DURATION);
		} catch (error) {
			handleErrors(error, "register");
			setFormLoading(false);
		}
	};

	return (
		<Box width="400px">
			<Typography variant="h4">Register</Typography>
			<Grid2 container component="form" onSubmit={handleSubmit(onSubmit)}>
				<Grid2 size={12} container display="block">
					<TextField type="text" {...register("firstName")} label="First name"></TextField>
					<TextField type="text" {...register("lastName")} label="Last name"></TextField>
					<TextField type="text" {...register("username")} label="Username"></TextField>
					<TextField type="password" {...register("password")} label="Password"></TextField>
					<TextField type="text" {...register("email")} label="E-mail"></TextField>
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
	);
};

export default Register;
