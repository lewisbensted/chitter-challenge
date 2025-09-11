import React, { forwardRef, useEffect, useState } from "react";
import axios from "axios";
import type { IReply } from "../interfaces/interfaces";
import { SubmitHandler, useForm } from "react-hook-form";
import { serverURL } from "../config/config";
import IconButton from "@mui/material/IconButton/IconButton";
import Edit from "@mui/icons-material/Edit";
import Done from "@mui/icons-material/Done";
import {
	Box,
	Card,
	CardActions,
	CardContent,
	CircularProgress,
	Grid2,
	Link,
	TextField,
	ThemeProvider,
	Typography,
} from "@mui/material";
import theme from "../styles/theme";
import Delete from "@mui/icons-material/Delete";
import { formatDate } from "../utils/formatDate";
import { Link as RouterLink } from "react-router-dom";
import { useError } from "../contexts/ErrorContext";
import { useAuth } from "../contexts/AuthContext";
import { useLayout } from "../contexts/LayoutContext";
import { useIsMounted } from "../utils/isMounted";
import toast from "react-hot-toast";

interface Props {
	setReplies: React.Dispatch<React.SetStateAction<IReply[]>>;
	setErrors: React.Dispatch<React.SetStateAction<string[]>>;
	reply: IReply;
	cheetId: string;
	numberOfReplies: number;
}

const Reply = forwardRef<HTMLDivElement, Props>(({ reply, cheetId, setReplies }, ref) => {
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
			setValue("text", reply.text);
		}
	}, [isEditing, reply.text, setValue]);

	const editReply: SubmitHandler<{ text: string }> = async (data) => {
		try {
			setEditLoading(true);
			const updatedReply = await axios.put<IReply>(
				`${serverURL}/api/cheets/${cheetId}/replies/${reply.uuid}`,
				data,
				{
					withCredentials: true,
				}
			);

			setReplies((prevReplies) =>
				prevReplies.map((reply) => (reply.uuid === updatedReply.data.uuid ? updatedReply.data : reply))
			);
		} catch (error) {
			if (isMounted.current) handleErrors(error, "editing reply");
			else toast("Failed to edit reply");
		} finally {
			setEditLoading(false);
			setEditing(false);
		}
	};

	const deleteReply = async () => {
		try {
			setDeleteLoading(true);
			await axios.delete(`${serverURL}/api/cheets/${reply.cheet.uuid}/replies/${reply.uuid}`, {
				withCredentials: true,
			});
			setReplies((prevReplies) => prevReplies.filter((r) => r.uuid !== reply.uuid));
		} catch (error) {
			if (isMounted.current) handleErrors(error, "deleting reply");
			else toast("Failed to delete reply");
		} finally {
			setDeleteLoading(false);
		}
	};

	const createdAt = new Date(reply.createdAt);
	const updatedAt = new Date(reply.updatedAt);
	const isEdited = updatedAt > createdAt;

	return (
		<ThemeProvider theme={theme}>
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
									{userId === reply.user.uuid &&
										(isEditLoading ? (
											<Box paddingTop={1.3} paddingLeft={1.4}>
												<CircularProgress size="1.3rem" thickness={6} />
											</Box>
										) : isEditing ? (
											<IconButton
												type="submit"
												form={`edit-reply-${reply.uuid}`}
												key={`edit-reply-${reply.uuid}`}
												sx={{ pointerEvents: isDeleteLoading ? "none" : undefined }}
											>
												<Done />
											</IconButton>
										) : (
											<IconButton
												onClick={() => {
													setEditing(true);
												}}
												sx={{ pointerEvents: isDeleteLoading ? "none" : undefined }}
											>
												<Edit />
											</IconButton>
										))}
								</Grid2>
								<Grid2 size={1}>
									{userId === reply.user.uuid &&
										(isDeleteLoading ? (
											<Box paddingTop={1.3} paddingLeft={1}>
												<CircularProgress size="1.3rem" thickness={6} />
											</Box>
										) : (
											<IconButton
												onClick={deleteReply}
												sx={{ pointerEvents: isEditLoading ? "none" : undefined }}
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
});

Reply.displayName = "Reply";

export default Reply;
