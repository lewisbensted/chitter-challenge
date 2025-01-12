import React, { useEffect, useState } from "react";
import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";
import ErrorModal from "../components/ErrorModal";
import SuccessModal from "../components/SuccessModal";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import { serverURL } from "../utils/serverURL";
import { handleErrors } from "../utils/handleErrors";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import AppRegistration from "@mui/icons-material/AppRegistration";
import IconButton from "@mui/material/IconButton/IconButton";
import FlexBox from "../styles/FlexBox";
import { Box, Button, Grid2, TextField, ThemeProvider, Typography } from "@mui/material";
import theme from "../styles/theme";

interface RegisterFormFields {
	firstName: string;
	lastName: string;
	username: string;
	password: string;
	email: string;
}

const Register: React.FC = () => {
	const { register, handleSubmit, reset } = useForm<RegisterFormFields>();
	const navigate = useNavigate();

	const [isPageLoading, setPageLoading] = useState<boolean>(true);
	const [isFormLoading, setFormLoading] = useState<boolean>(false);
	const [userId, setUserId] = useState<string>();
	const [errors, setErrors] = useState<string[]>([]);
	const [isSuccessOpen, setSuccessOpen] = useState<boolean>(false);

	useEffect(() => {
		axios
			.get(`${serverURL}/validate`, { withCredentials: true })
			.then(() => {
				navigate("/");
			})
			.catch((error: unknown) => {
				if (axios.isAxiosError(error) && error.response?.status == 401) {
					setUserId(undefined);
				} else {
					handleErrors(error, "authenticating the user", setErrors);
				}
				setPageLoading(false);
			});
	}, []);

	const onSubmit: SubmitHandler<RegisterFormFields> = async (data) => {
		setFormLoading(true);
		reset();
		await axios
			.post(`${serverURL}/register`, data)
			.then(() => {
				setSuccessOpen(true);
			})
			.catch((error: unknown) => {
				handleErrors(error, "registering the user", setErrors);
			});
		setFormLoading(false);
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
					<ErrorModal errors={errors} closeModal={() => setErrors([])} />
					<SuccessModal
						isOpen={isSuccessOpen}
						message="Account created."
						closeModal={() => {
							setSuccessOpen(false);
						}}
					/>
					<Typography variant="h4">Register</Typography>
					{isPageLoading ? (
						<FlexBox>
							<CircularProgress thickness={5} />
						</FlexBox>
					) : (
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
									<CircularProgress />
								) : (
									<FlexBox>
										<Button type="submit" disabled={!!userId} color="primary" variant="contained">
											<Typography variant="button" color="secondary">
												Register
											</Typography>
											<IconButton color="secondary">
												<AppRegistration />
											</IconButton>
										</Button>
									</FlexBox>
								)}
							</Grid2>
						</Grid2>
					)}
				</Box>
			</Layout>
		</ThemeProvider>
	);
};

export default Register;
