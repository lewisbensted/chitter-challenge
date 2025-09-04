import React, { forwardRef, useEffect, useState } from "react";
import type { ICheet } from "../interfaces/interfaces";
import { useParams } from "react-router-dom";
import theme from "../styles/theme";
import {
	Box,
	Card,
	CardActions,
	CardContent,
	CircularProgress,
	Grid2,
	IconButton,
	Link,
	TextField,
	ThemeProvider,
	Typography,
} from "@mui/material";
import { SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { serverURL } from "../config/config";
import { Delete, Done, Edit, OpenInNew } from "@mui/icons-material";
import { formatDate } from "../utils/formatDate";
import { Link as RouterLink } from "react-router-dom";
import { useError } from "../contexts/ErrorContext";
import { useAuth } from "../contexts/AuthContext";

interface Props {
	userId?: string | null;
	cheet: ICheet;
	setErrors: React.Dispatch<React.SetStateAction<string[]>>;
	setCheets: React.Dispatch<React.SetStateAction<ICheet[]>>;
	isDisabled: boolean;
	isModalView: boolean;
	numberOfCheets: number;
	setSelectedCheet: React.Dispatch<React.SetStateAction<ICheet | null | undefined>>;
}

const Cheet = forwardRef<HTMLDivElement, Props>(
	({ cheet, setCheets, isDisabled, isModalView, setSelectedCheet }, ref) => {
		const { id } = useParams();
		const { register, handleSubmit, setValue } = useForm<{ text: string }>();
		const [isEditing, setEditing] = useState<boolean>(false);
		const [isEditLoading, setEditLoading] = useState<boolean>(false);
		const [isDeleteLoading, setDeleteLoading] = useState<boolean>(false);
		const { handleErrors } = useError();
		const { userId, setComponentLoading } = useAuth();

		useEffect(() => {
			if (isEditing) {
				setValue("text", cheet.text);
			}
		}, [isEditing, cheet.text, setValue]);

		const editCheet: SubmitHandler<{ text: string }> = async (data) => {
			try {
				setEditLoading(true);
				setComponentLoading(true);
				const updatedCheet = await axios.put<ICheet>(
					`${serverURL + (id ? `/users/${id}/` : "/")}cheets/${cheet.uuid}`,
					data,
					{
						withCredentials: true,
					}
				);

				setCheets((prevCheets) =>
					prevCheets.map((cheet) => (cheet.uuid === updatedCheet.data.uuid ? updatedCheet.data : cheet))
				);
				if (isModalView) {
					setSelectedCheet(updatedCheet.data);
				}
			} catch (error) {
				handleErrors(error, "editing the cheet");
			} finally {
				setEditing(false);
				setEditLoading(false);
				setComponentLoading(false);
			}
		};

		const deleteCheet = async () => {
			try {
				setDeleteLoading(true);
				setComponentLoading(true);
				await axios.delete(`${serverURL + (id ? `/users/${id}/` : "/")}cheets/${cheet.uuid}`, {
					withCredentials: true,
				});

				setCheets((prevCheets) => prevCheets.filter((c) => c.uuid !== cheet.uuid));
				setSelectedCheet(null);
			} catch (error) {
				handleErrors(error, "deleting the cheet");
			} finally {
				setDeleteLoading(false);
				setComponentLoading(false);
			}
		};

		const oneHourAgo = new Date(new Date().getTime() - 1000 * 60 * 60);
		const createdAt = new Date(cheet.createdAt);
		const updatedAt = new Date(cheet.updatedAt);
		const isEdited = updatedAt > createdAt;
		const isEditDisabled = cheet.cheetStatus.hasReplies || createdAt < oneHourAgo;

		return (
			<ThemeProvider theme={theme}>
				<Card ref={ref}>
					<Grid2 container width={isModalView ? "auto" : 750}>
						<Grid2 size={isModalView ? (userId ? 10.5 : 12) : userId ? 10 : 11}>
							<CardContent>
								<Grid2 container>
									<Grid2 size={6}>
										<Typography>
											<Link component={RouterLink} to={`/users/${cheet.user.uuid}`}>
												{cheet.user.username}
											</Link>
										</Typography>
									</Grid2>
									<Grid2 size={6}>
										<Typography variant="body2" justifyContent="flex-end">
											{formatDate(createdAt, isModalView)}
										</Typography>
									</Grid2>
									<Grid2 size={isEdited ? 9 : 12}>
										{isEditing ? (
											<Box
												component="form"
												onSubmit={handleSubmit((data) => {
													if (isDisabled) {
														return;
													}
													editCheet(data);
												})}
												id={`edit-cheet-${cheet.uuid}`}
											>
												<TextField {...register("text")} type="text" variant="standard" />
											</Box>
										) : (
											<Typography>{cheet.text}</Typography>
										)}
									</Grid2>
									{isEdited && (
										<Grid2 size={3} container justifyContent="flex-end" marginTop={0.4}>
											<Typography variant="body2">
												<Edit fontSize="small" color="primary" />
												{isModalView ? formatDate(updatedAt) : ""}
											</Typography>
										</Grid2>
									)}
								</Grid2>
							</CardContent>
						</Grid2>
						<Grid2
							size={isModalView ? (userId ? 1.5 : 0) : userId ? 2 : 1}
							container
							justifyContent={isModalView ? "center" : "space-between"}
						>
							<CardActions>
								<Grid2 container size={12} columns={isModalView ? 2 : 3}>
									<Grid2 size={isModalView ? 0 : 1}>
										{!isModalView && (
											<IconButton
												onClick={() => {
													setSelectedCheet(cheet);
												}}
											>
												<OpenInNew />
											</IconButton>
										)}
									</Grid2>

									<Grid2 size={1}>
										{userId === cheet.user.uuid &&
											(isEditLoading ? (
												<Box paddingTop={1.3} paddingLeft={1.4}>
													<CircularProgress size="1.3rem" thickness={6} />
												</Box>
											) : isEditing ? (
												<IconButton
													type="submit"
													disabled={isEditDisabled}
													form={`edit-cheet-${cheet.uuid}`}
													key={`edit-cheet-${cheet.uuid}`}
													sx={{ pointerEvents: isDisabled ? "none" : undefined }}
												>
													<Done />
												</IconButton>
											) : (
												<IconButton
													onClick={() => {
														setEditing(true);
													}}
													sx={{ pointerEvents: isDisabled ? "none" : undefined }}
													disabled={isEditDisabled}
												>
													<Edit />
												</IconButton>
											))}
									</Grid2>
									<Grid2 size={1}>
										{userId === cheet.user.uuid &&
											(isDeleteLoading ? (
												<Box paddingTop={1.3} paddingLeft={1}>
													<CircularProgress size="1.3rem" thickness={6} />
												</Box>
											) : (
												<IconButton
													onClick={deleteCheet}
													sx={{ pointerEvents: isDisabled ? "none" : undefined }}
												>
													<Delete />
												</IconButton>
											))}
									</Grid2>
								</Grid2>
							</CardActions>
						</Grid2>
					</Grid2>
				</Card>
			</ThemeProvider>
		);
	}
);

Cheet.displayName = "Cheet";

export default Cheet;
