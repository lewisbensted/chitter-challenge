import React, { useEffect, useState } from "react";
import axios from "axios";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { serverURL } from "../config/config";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import FlexBox from "../styles/FlexBox";
import { Box, Button, Grid2, TextField, Typography } from "@mui/material";
import Login from "@mui/icons-material/Login";
import { useAuth } from "../contexts/AuthContext";
import { useError } from "../contexts/ErrorContext";
import { useLayout } from "../contexts/LayoutContext";

interface LoginFormFields {
	username: string;
	password: string;
}

const SignIn: React.FC = () => {
	const { register, handleSubmit } = useForm<LoginFormFields>();
	const navigate = useNavigate();
	const [isFormLoading, setFormLoading] = useState<boolean>(false);

	const { handleErrors } = useError();

	const { userId, isValidateLoading, setUserId } = useAuth();

	const { setLoadingTimer } = useLayout();

	useEffect(() => {
		if (userId && !isValidateLoading) {
			void navigate("/");
		}
	}, [userId, isValidateLoading, navigate]);

	const onSubmit: SubmitHandler<LoginFormFields> = async (data) => {
		setFormLoading(true);
		try {
			const res = await axios.post<string>(`${serverURL}/api/login`, data, { withCredentials: true });
			setUserId(res.data);
			setLoadingTimer(true);
			void navigate("/");
		} catch (error) {
			handleErrors(error, "log in");
		} finally {
			setFormLoading(false);
		}
	};

	return (
		<Box width="400px">
			<Typography variant="h4">Sign In</Typography>
			<Grid2 container component="form" onSubmit={handleSubmit(onSubmit)}>
				<Grid2 size={12} container display="block">
					<TextField type="text" {...register("username")} label="Username"></TextField>

					<TextField type="password" {...register("password")} label="Password"></TextField>
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
		</Box>
	);
};

export default SignIn;
