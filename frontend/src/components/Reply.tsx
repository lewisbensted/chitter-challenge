import React, { forwardRef, useCallback, useEffect, useState } from "react";
import axios from "axios";
import type { IReply } from "../interfaces/interfaces";
import { type SubmitHandler, useForm } from "react-hook-form";
import { serverURL } from "../config/config";
import IconButton from "@mui/material/IconButton/IconButton";
import Edit from "@mui/icons-material/Edit";
import Done from "@mui/icons-material/Done";
import { Box, Card, CardActions, CardContent, Grid2, Link, TextField, Typography } from "@mui/material";
import Delete from "@mui/icons-material/Delete";
import { formatDate } from "../utils/formatDate";
import { Link as RouterLink } from "react-router-dom";
import { useError } from "../contexts/ErrorContext";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";
import { throwApiError } from "../utils/apiResponseError";

interface Props {
	setReplies: React.Dispatch<React.SetStateAction<IReply[]>>;
	reply: IReply;
	cheetId: string;
	isModalMounted: React.MutableRefObject<boolean>;
}

const Reply = forwardRef<HTMLDivElement, Props>(({ reply, cheetId, setReplies, isModalMounted }, ref) => {
	const { register, handleSubmit, setValue } = useForm<{ text: string }>();
	const [isEditing, setEditing] = useState<boolean>(false);
	const [isEditLoading, setEditLoading] = useState<boolean>(false);
	const [isDeleteLoading, setDeleteLoading] = useState<boolean>(false);

	const { handleErrors } = useError();
	const { userId } = useAuth();

	useEffect(() => {
		if (isEditing) {
			setValue("text", reply.text);
		}
	}, [isEditing, reply.text, setValue]);

	const [pendingReplyEdited, setPendingReplyEdited] = useState<IReply | null>(null);
	const [pendingErrorEdited, setPendingErrorEdited] = useState<unknown>(null);

	const [pendingReplyDeleted, setPendingReplyDeleted] = useState<IReply | null>(null);
	const [pendingErrorDeleted, setPendingErrorDeleted] = useState<unknown>(null);

	const editReply: SubmitHandler<{ text: string }> = async (data) => {
		setEditLoading(true);
		try {
			const res = await axios.put<IReply>(`${serverURL}/api/cheets/${cheetId}/replies/${reply.uuid}`, data, {
				withCredentials: true,
			});
			const updatedReply = res.data;
			if (typeof updatedReply !== "object") throwApiError("object", updatedReply);
			if (isModalMounted.current) setPendingReplyEdited(updatedReply);
		} catch (error) {
			if (isModalMounted.current) setPendingErrorEdited(error);
			else handleErrors(error, "edit reply", false);
		} finally {
			if (isModalMounted.current) {
				setEditLoading(false);
				setEditing(false);
			}
		}
	};

	const deleteReply = async () => {
		setDeleteLoading(true);
		try {
			await axios.delete(`${serverURL}/api/cheets/${reply.cheetId}/replies/${reply.uuid}`, {
				withCredentials: true,
			});
			if (isModalMounted.current) setPendingReplyDeleted(reply);
		} catch (error) {
			if (isModalMounted.current) setPendingErrorDeleted(error);
			else handleErrors(error, "delete reply", false);
		} finally {
			if (isModalMounted.current) setDeleteLoading(false);
		}
	};

	const applyPendingEdit = useCallback(() => {
		if (pendingReplyEdited) {
			if (!isModalMounted.current) return;
			setReplies((prevReplies) =>
				prevReplies.map((reply) => (reply.uuid === pendingReplyEdited.uuid ? pendingReplyEdited : reply))
			);
			setPendingReplyEdited(null);
		}
		if (pendingErrorEdited) {
			handleErrors(pendingErrorEdited, "edit reply", isModalMounted.current);
			if (isModalMounted.current) setPendingErrorEdited(null);
		}
	}, [handleErrors, isModalMounted, pendingErrorEdited, pendingReplyEdited, setReplies]);

	const applyPendingDelete = useCallback(() => {
		if (pendingReplyDeleted) {
			if (!isModalMounted.current) return;
			setReplies((prevReplies) => prevReplies.filter((reply) => reply.uuid !== pendingReplyDeleted.uuid));
			setPendingReplyDeleted(null);
		}
		if (pendingErrorDeleted) {
			handleErrors(pendingErrorDeleted, "delete reply", isModalMounted.current);
			if (isModalMounted.current) setPendingErrorDeleted(null);
		}
	}, [handleErrors, isModalMounted, pendingErrorDeleted, pendingReplyDeleted, setReplies]);

	const createdAt = new Date(reply.createdAt);
	const updatedAt = new Date(reply.updatedAt);
	const isEdited = updatedAt > createdAt;
	const isLoading = isEditLoading || isDeleteLoading;

	return (
		<Card ref={ref}>
			<Grid2 container>
				<Grid2 size={userId ? 10.5 : 12}>
					<CardContent>
						<Grid2 container>
							<Grid2 size={6}>
								<Typography>
									<Link to={`/users/${reply.user.uuid}`} component={RouterLink}>
										{reply.user.username}
									</Link>
								</Typography>
							</Grid2>
							<Grid2 size={6}>
								<Typography variant="body2" justifyContent="flex-end">
									{formatDate(createdAt)}
								</Typography>
							</Grid2>
							<Grid2 size={isEdited ? 10 : 12}>
								{isEditing ? (
									<Box
										component="form"
										onSubmit={handleSubmit(editReply)}
										id={`edit-reply-${reply.uuid}`}
									>
										<TextField {...register("text")} type="text" variant="standard" />
									</Box>
								) : (
									<Typography>{reply.text}</Typography>
								)}
							</Grid2>
							{isEdited && (
								<Grid2 size={2} container justifyContent="flex-end" marginTop={0.4}>
									<Typography variant="body2">
										<Edit fontSize="small" color="primary" />
										{formatDate(updatedAt)}
									</Typography>
								</Grid2>
							)}
						</Grid2>
					</CardContent>
				</Grid2>
				<Grid2 size={1.5} container justifyContent={"space-between"}>
					<CardActions>
						<Grid2 container size={12} columns={2} justifyContent={"space-around"}>
							<Grid2 size={1}>
								{userId === reply.user.uuid && (
									<LoadingSpinner
										isLoading={isEditLoading}
										onFinished={applyPendingEdit}
										isLarge={false}
									>
										{isEditing ? (
											<IconButton
												type="submit"
												form={`edit-reply-${reply.uuid}`}
												key={`edit-reply-${reply.uuid}`}
												sx={{ pointerEvents: isLoading ? "none" : undefined }}
											>
												<Done />
											</IconButton>
										) : (
											<IconButton
												onClick={() => {
													setEditing(true);
												}}
												sx={{ pointerEvents: isLoading ? "none" : undefined }}
											>
												<Edit />
											</IconButton>
										)}
									</LoadingSpinner>
								)}
							</Grid2>
							<Grid2 size={1}>
								{userId === reply.user.uuid && (
									<LoadingSpinner
										isLoading={isDeleteLoading}
										onFinished={applyPendingDelete}
										isLarge={false}
									>
										<IconButton
											onClick={deleteReply}
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
});

Reply.displayName = "Reply";

export default Reply;
