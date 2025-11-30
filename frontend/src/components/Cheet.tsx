import React, { forwardRef, useCallback, useEffect, useState } from "react";
import type { ICheet } from "../interfaces/interfaces";
import { Box, Card, CardActions, CardContent, Grid2, IconButton, Link, TextField, Typography } from "@mui/material";
import { type SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";
import { serverURL } from "../config/config";
import { Delete, Done, Edit, OpenInNew } from "@mui/icons-material";
import { formatDate } from "../utils/formatDate";
import { Link as RouterLink } from "react-router-dom";
import { useError } from "../contexts/ErrorContext";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";
import { throwApiError } from "../utils/apiResponseError";

interface Props {
	cheet: ICheet;
	setCheets: React.Dispatch<React.SetStateAction<ICheet[]>>;
	isModalView: boolean;
	setSelectedCheet: React.Dispatch<React.SetStateAction<ICheet | null | undefined>>;
	setCheetLoading?: React.Dispatch<React.SetStateAction<boolean>>;
	isPageMounted: React.MutableRefObject<boolean>;
}

const Cheet = forwardRef<HTMLDivElement, Props>(
	({ cheet, setCheets, isModalView, setSelectedCheet, setCheetLoading, isPageMounted }, ref) => {
		const { register, handleSubmit, setValue } = useForm<{ text: string }>();
		const [isEditing, setEditing] = useState<boolean>(false);
		const [isEditLoading, setEditLoading] = useState<boolean>(false);
		const [isDeleteLoading, setDeleteLoading] = useState<boolean>(false);
		const { handleErrors } = useError();
		const { userId } = useAuth();

		useEffect(() => {
			if (isEditing) {
				setValue("text", cheet.text);
			}
		}, [isEditing, cheet.text, setValue]);

		const [pendingCheetEdited, setPendingCheetEdited] = useState<ICheet | null>(null);
		const [pendingErrorEdited, setPendingErrorEdited] = useState<unknown>(null);

		const [pendingCheetDeleted, setPendingCheetDeleted] = useState<ICheet | null>(null);
		const [pendingErrorDeleted, setPendingErrorDeleted] = useState<unknown>(null);

		const editCheet: SubmitHandler<{ text: string }> = async (data) => {
			setEditLoading(true);
			if (setCheetLoading) setCheetLoading(true);
			try {
				const res = await axios.put<ICheet>(`${serverURL}/api/cheets/${cheet.uuid}`, data, {
					withCredentials: true,
				});
				const updatedCheet = res.data;
				if (typeof updatedCheet !== "object") throwApiError("object", updatedCheet);
				if (isPageMounted.current) setPendingCheetEdited(updatedCheet);
			} catch (error) {
				if (isPageMounted.current) setPendingErrorEdited(error);
				else handleErrors(error, "edit cheet", false);
			} finally {
				if (isPageMounted.current) {
					setEditing(false);
					setEditLoading(false);
					if (setCheetLoading) setCheetLoading(false);
				}
			}
		};

		const deleteCheet = async () => {
			setDeleteLoading(true);
			if (setCheetLoading) setCheetLoading(true);
			try {
				await axios.delete(`${serverURL}/api/cheets/${cheet.uuid}`, {
					withCredentials: true,
				});
				if (isPageMounted.current) setPendingCheetDeleted(cheet);
			} catch (error) {
				if (isPageMounted.current) setPendingErrorDeleted(error);
				else handleErrors(error, "delete cheet", false);
			} finally {
				if (isPageMounted.current) {
					setDeleteLoading(false);
					if (setCheetLoading) setCheetLoading(false);
				}
			}
		};

		const applyPendingEdit = useCallback(() => {
			if (pendingCheetEdited) {
				if (!isPageMounted.current) return;
				setCheets((prevCheets) =>
					prevCheets.map((cheet) => (cheet.uuid === pendingCheetEdited.uuid ? pendingCheetEdited : cheet))
				);
				if (isModalView) {
					setSelectedCheet(pendingCheetEdited);
				}
				setPendingCheetEdited(null);
			}
			if (pendingErrorEdited) {
				handleErrors(pendingErrorEdited, "edit cheet", isPageMounted.current);
				if (!isPageMounted.current) setPendingErrorEdited(null);
			}
		}, [pendingCheetEdited, pendingErrorEdited, isPageMounted, isModalView, handleErrors, setCheets, setSelectedCheet]);

		const applyPendingDelete = useCallback(() => {
			if (pendingCheetDeleted) {
				if (!isPageMounted.current) return;
				setCheets((prevCheets) => prevCheets.filter((cheet) => cheet.uuid !== pendingCheetDeleted.uuid));
				setSelectedCheet(null);
				setPendingCheetDeleted(null);
			}
			if (pendingErrorDeleted) {
				handleErrors(pendingErrorDeleted, "delete cheet", isPageMounted.current);
				if (isPageMounted.current) setPendingErrorDeleted(null);
			}
		}, [pendingCheetDeleted, pendingErrorDeleted, isPageMounted, handleErrors, setCheets, setSelectedCheet]);

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
