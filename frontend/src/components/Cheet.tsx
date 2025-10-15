import React, { forwardRef, useEffect, useState } from "react";
import type { ICheet } from "../interfaces/interfaces";
import { useParams } from "react-router-dom";
import { Box, Card, CardActions, CardContent, Grid2, IconButton, Link, TextField, Typography } from "@mui/material";
import { type SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { serverURL } from "../config/config";
import { Delete, Done, Edit, OpenInNew } from "@mui/icons-material";
import { formatDate } from "../utils/formatDate";
import { Link as RouterLink } from "react-router-dom";
import { useError } from "../contexts/ErrorContext";
import { useAuth } from "../contexts/AuthContext";
import { useLayout } from "../contexts/LayoutContext";
import { useIsMounted } from "../utils/isMounted";
import LoadingSpinner from "./LoadingSpinner";
import { throwApiError } from "../utils/apiResponseError";

interface Props {
	userId?: string | null;
	cheet: ICheet;
	setErrors: React.Dispatch<React.SetStateAction<string[]>>;
	setCheets: React.Dispatch<React.SetStateAction<ICheet[]>>;
	isModalView: boolean;
	numberOfCheets: number;
	setSelectedCheet: React.Dispatch<React.SetStateAction<ICheet | null | undefined>>;
	setCheetLoading?: React.Dispatch<React.SetStateAction<boolean>>;
}

const Cheet = forwardRef<HTMLDivElement, Props>(
	({ cheet, setCheets, isModalView, setSelectedCheet, setCheetLoading }, ref) => {
		const { id } = useParams();
		const { register, handleSubmit, setValue } = useForm<{ text: string }>();
		const [isEditing, setEditing] = useState<boolean>(false);
		const [isEditLoading, setEditLoading] = useState<boolean>(false);
		const [isDeleteLoading, setDeleteLoading] = useState<boolean>(false);
		const { handleErrors } = useError();
		const { userId } = useAuth();

		useLayout();

		const isMounted = useIsMounted();

		useEffect(() => {
			if (isEditing) {
				setValue("text", cheet.text);
			}
		}, [isEditing, cheet.text, setValue]);

		const [pendingCheet, setPendingCheet] = useState<ICheet | null>(null);
		const [pendingError, setPendingError] = useState<unknown>(null);

		const editCheet: SubmitHandler<{ text: string }> = async (data) => {
			try {
				setEditLoading(true);
				if (setCheetLoading) setCheetLoading(true);
				const res = await axios.put<ICheet>(
					`${serverURL + (id ? `/users/${id}` : "")}/api/cheets/${cheet.uuid}`,
					data,
					{
						withCredentials: true,
					}
				);
				const updatedCheet = res.data;
				if (typeof updatedCheet !== "object") throwApiError("object", updatedCheet);
				setPendingCheet(updatedCheet);
			} catch (error) {
				setPendingError(error);
			} finally {
				setEditing(false);
				setEditLoading(false);
				if (setCheetLoading) setCheetLoading(false);
			}
		};

		const deleteCheet = async () => {
			try {
				setDeleteLoading(true);
				if (setCheetLoading) setCheetLoading(true);
				await axios.delete(`${serverURL + (id ? `/users/${id}` : "")}/api/cheets/${cheet.uuid}`, {
					withCredentials: true,
				});
				setPendingCheet(cheet);
			} catch (error) {
				setPendingError(error);
				handleErrors(error, "delete cheet", isMounted.current);
			} finally {
				setDeleteLoading(false);
				if (setCheetLoading) setCheetLoading(false);
			}
		};

		const applyPendingEdit = () => {
			if (pendingCheet) {
				setCheets((prevCheets) =>
					prevCheets.map((cheet) => (cheet.uuid === pendingCheet.uuid ? pendingCheet : cheet))
				);
				if (isModalView) {
					setSelectedCheet(pendingCheet);
				}
				setPendingCheet(null);
			}
			if (pendingError) {
				handleErrors(pendingError, "edit cheet");
				setPendingError(null);
			}
		};

		const applyPendingDelete = () => {
			if (pendingCheet) {
				setCheets((prevCheets) => prevCheets.filter((cheet) => cheet.uuid !== pendingCheet.uuid));
				setSelectedCheet(null);
				setPendingCheet(null);
			}
			if (pendingError) {
				handleErrors(pendingError, "delete cheet");
				setPendingError(null);
			}
		};

		const oneHourAgo = new Date(new Date().getTime() - 1000 * 60 * 60);
		const createdAt = new Date(cheet.createdAt);
		const updatedAt = new Date(cheet.updatedAt);
		const isEdited = updatedAt > createdAt;
		const isEditDisabled = cheet.cheetStatus.hasReplies || createdAt < oneHourAgo;
		const isLoading = isEditLoading || isDeleteLoading;

		return (
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
											onSubmit={handleSubmit(editCheet)}
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
									{userId === cheet.user.uuid && (
										<LoadingSpinner
											isLoading={isEditLoading}
											onFinished={applyPendingEdit}
											isLarge={false}
										>
											{isEditing ? (
												<IconButton
													type="submit"
													disabled={isEditDisabled}
													form={`edit-cheet-${cheet.uuid}`}
													key={`edit-cheet-${cheet.uuid}`}
													sx={{ pointerEvents: isLoading ? "none" : undefined }}
												>
													<Done />
												</IconButton>
											) : (
												<IconButton
													onClick={() => {
														setEditing(true);
													}}
													disabled={isEditDisabled}
													sx={{ pointerEvents: isLoading ? "none" : undefined }}
												>
													<Edit />
												</IconButton>
											)}
										</LoadingSpinner>
									)}
								</Grid2>
								<Grid2 size={1}>
									{userId === cheet.user.uuid && (
										<LoadingSpinner
											isLoading={isDeleteLoading}
											isLarge={false}
											onFinished={applyPendingDelete}
										>
											<IconButton
												onClick={deleteCheet}
												sx={{ pointerEvents: isLoading ? "none" : undefined }}
											>
												<Delete />
											</IconButton>
										</LoadingSpinner>
									)}
								</Grid2>
							</Grid2>
						</CardActions>
					</Grid2>
				</Grid2>
			</Card>
		);
	}
);

Cheet.displayName = "Cheet";

export default Cheet;
