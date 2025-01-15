import React, { useState } from "react";
import axios from "axios";
import { IReply } from "../utils/interfaces";
import { SubmitHandler, useForm } from "react-hook-form";
import { serverURL } from "../utils/serverURL";
import { handleErrors } from "../utils/handleErrors";
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
import { format } from "date-fns";
import theme from "../styles/theme";
import Delete from "@mui/icons-material/Delete";

interface Props {
	isComponentLoading: boolean;
	setComponentLoading: (arg: boolean) => void;
	setReplies: (arg: IReply[]) => void;
	setErrors: (arg: string[]) => void;
	reply: IReply;
	cheetId: string;
	userId?: string;
}

const Reply: React.FC<Props> = ({
	reply,
	cheetId,
	isComponentLoading,
	setComponentLoading,
	setReplies,
	setErrors,
	userId,
}) => {
	const { register, handleSubmit } = useForm<{ text: string }>();
	const [isEditing, setEditing] = useState<boolean>(false);
	const [isEditLoading, setEditLoading] = useState<boolean>(false);
	const [isDeleteLoading, setDeleteLoading] = useState<boolean>(false);

	const onSubmit: SubmitHandler<{ text: string }> = async (data) => {
		setEditLoading(true);
		setComponentLoading(true);
		await axios
			.put(`${serverURL}/cheets/${cheetId}/replies/${reply.uuid}`, data, {
				withCredentials: true,
			})
			.then((res: { data: IReply[] }) => {
				setReplies(res.data);
			})
			.catch((error: unknown) => {
				handleErrors(error, "editing the reply", setErrors);
			});
		setEditLoading(false);
		setComponentLoading(false);
		setEditing(false);
	};

	return (
		<ThemeProvider theme={theme}>
			<Card>
				<Grid2 container>
					<Grid2 size={10}>
						<CardContent>
							<Grid2 container>
								<Grid2 size={6}>
									<Link href={`/users/${reply.user.uuid}`}>{reply.user.username}</Link>
								</Grid2>
								<Grid2 size={6}>
									<Typography variant="body2" justifyContent="flex-end">
										{format(reply.createdAt, "HH:mm dd/MM/yy")}
									</Typography>
								</Grid2>
								<Grid2 size={12}>
									{isEditing ? (
										<Box component="form" onSubmit={handleSubmit(onSubmit)} id="edit-reply">
											<TextField
												{...register("text")}
												type="text"
												defaultValue={reply.text}
												variant="standard"
											/>
										</Box>
									) : (
										<Typography>{reply.text}</Typography>
									)}
								</Grid2>
							</Grid2>
						</CardContent>
					</Grid2>
					<Grid2 size={2} container>
						<CardActions>
							<Grid2 container size={12} columns={2}>
								<Grid2 size={1}>
									{userId === reply.user.uuid ? (
										isEditLoading ? (
											<Box paddingTop={1.3} paddingLeft={1.4}>
												<CircularProgress size="1.3rem" thickness={6} />
											</Box>
										) : isEditing ? (
											<IconButton
												type="submit"
												disabled={isComponentLoading}
												form="edit-reply"
												key="edit-reply"
												color="primary"
											>
												<Done />
											</IconButton>
										) : (
											<IconButton onClick={() => { setEditing(true); }} color="primary">
												<Edit />
											</IconButton>
										)
									) : null}
								</Grid2>
								<Grid2 size={1}>
									{userId === reply.user.uuid ? (
										isDeleteLoading ? (
											<Box paddingTop={1.3} paddingLeft={1}>
												<CircularProgress size="1.3rem" thickness={6} />
											</Box>
										) : (
											<IconButton
												color="primary"
												disabled={isComponentLoading}
												onClick={async () => {
													setDeleteLoading(true);
													setComponentLoading(true);
													await axios
														.delete(
															`${serverURL}/cheets/${reply.cheet.uuid}/replies/${reply.uuid}`,
															{
																withCredentials: true,
															}
														)
														.then((res: { data: IReply[] }) => {
															setReplies(res.data);
														})
														.catch((error: unknown) => {
															handleErrors(error, "deleting the reply", setErrors);
														});
													setDeleteLoading(false);
													setComponentLoading(false);
												}}
											>
												<Delete />
											</IconButton>
										)
									) : null}
								</Grid2>
							</Grid2>
						</CardActions>
					</Grid2>
				</Grid2>
			</Card>
		</ThemeProvider>
	);
};

export default Reply;
