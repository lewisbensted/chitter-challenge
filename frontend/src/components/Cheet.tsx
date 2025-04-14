import React, { useState } from "react";
import { ICheet } from "../utils/interfaces";
import { format } from "date-fns";
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
import { serverURL } from "../utils/serverURL";
import { handleErrors } from "../utils/handleErrors";
import { Delete, Done, Edit, OpenInNew } from "@mui/icons-material";
import CheetModal from "./CheetModal";
import { formatDate } from "../utils/formatDate";

interface Props {
	userId?: string;
	cheet: ICheet;
	setErrors: (arg: string[]) => void;
	setCheets: (arg: ICheet[]) => void;
	isComponentLoading: boolean;
	setComponentLoading: (arg: boolean) => void;
	isModalView: boolean;
	closeModal?: () => void;
	numberOfCheets: number
}

const Cheet: React.FC<Props> = ({
	userId,
	cheet,
	setErrors,
	setCheets,
	setComponentLoading,
	isComponentLoading,
	isModalView,
	numberOfCheets
}) => {
	const { id } = useParams();
	const { register, handleSubmit } = useForm<{ text: string }>();
	const [isEditing, setEditing] = useState<boolean>(false);
	const [isModalOpen, setModalOpen] = useState<boolean>(false);
	const [isEditLoading, setEditLoading] = useState<boolean>(false);
	const [isDeleteLoading, setDeleteLoading] = useState<boolean>(false);

	const onSubmit: SubmitHandler<{ text: string }> = async (data) => {
		setEditLoading(true);
		setComponentLoading(true);
		await axios
			.put(`${serverURL + (id ? `/users/${id}/` : "/")}cheets/${cheet.uuid}?page=0&take=${numberOfCheets}`, data, {
				withCredentials: true,
			})
			.then((res: { data: ICheet[] }) => {
				setCheets(res.data);
			})
			.catch((error: unknown) => {
				handleErrors(error, "editing the cheet", setErrors);
			});
		setEditing(false);
		setEditLoading(false);
		setComponentLoading(false);
	};

	const createdAt = new Date(cheet.createdAt);
	const updatedAt = new Date(cheet.updatedAt);
	const isEdited = updatedAt > createdAt;

	return (
		<ThemeProvider theme={theme}>
			{isModalView ? null : (
				<CheetModal
					cheet={cheet}
					userId={userId}
					isOpen={isModalOpen}
					closeModal={() => {
						setModalOpen(false);
					}}
					setCheets={setCheets}
					isComponentLoading={isComponentLoading}
					setComponentLoading={setComponentLoading}
					numberOfCheets={numberOfCheets}
				/>
			)}
			<Card>
				<Grid2 container width={isModalView ? "auto" : 750}>
					<Grid2 size={isModalView ? (userId ? 10.5 : 12) : userId ? 10 : 11}>
						<CardContent>
							<Grid2 container>
								<Grid2 size={6}>
									<Typography>
										<Link href={`/users/${cheet.user.uuid}`}>{cheet.user.username}</Link>
									</Typography>
								</Grid2>
								<Grid2 size={6}>
									<Typography variant="body2" justifyContent="flex-end">
										{format(createdAt, "HH:mm dd/MM/yy")}
									</Typography>
								</Grid2>
								<Grid2 size={isEdited ? 10 : 12}>
									{isEditing ? (
										<Box
											component="form"
											onSubmit={handleSubmit(onSubmit)}
											id={`edit-cheet-${cheet.uuid}`}
										>
											<TextField
												{...register("text")}
												type="text"
												defaultValue={cheet.text}
												variant="standard"
											/>
										</Box>
									) : (
										<Typography>{cheet.text}</Typography>
									)}
								</Grid2>
								{isEdited ? (
									<Grid2 size={2} container justifyContent="flex-end" marginTop={0.4}>
										<Typography variant="body2">
											<Edit fontSize="small" color="primary" />
											{formatDate(updatedAt)}
										</Typography>
									</Grid2>
								) : null}
							</Grid2>
						</CardContent>
					</Grid2>
					<Grid2
						size={isModalView ? (userId ? 1.5 : 0) : userId ? 2 : 1}
						container
						justifyContent={isModalView ? "center" : "space-between"}
					>
						<CardActions>
							<Grid2 container size={12} columns={isModalView ? 1 : 3}>
								<Grid2 size={1}>
									{isModalView ? null : (
										<IconButton
											color="primary"
											onClick={() => {
												setModalOpen(true);
											}}
											disabled={isComponentLoading}
										>
											<OpenInNew />
										</IconButton>
									)}
								</Grid2>

								<Grid2 size={1}>
									{userId === cheet.user.uuid ? (
										isEditLoading ? (
											<Box paddingTop={1.3} paddingLeft={1.4}>
												<CircularProgress size="1.3rem" thickness={6} />
											</Box>
										) : isEditing ? (
											<IconButton
												type="submit"
												disabled={isComponentLoading}
												form={`edit-cheet-${cheet.uuid}`}
												key={`edit-cheet-${cheet.uuid}`}
												color="primary"
											>
												<Done />
											</IconButton>
										) : (
											<IconButton
												onClick={() => {
													setEditing(true);
												}}
												color="primary"
											>
												<Edit />
											</IconButton>
										)
									) : null}
								</Grid2>
								<Grid2 size={1}>
									{userId === cheet.user.uuid && !isModalView ? (
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
															`${serverURL + (id ? `/users/${id}/` : "/")}cheets/${
																cheet.uuid
															}?page=0&take=${numberOfCheets}`,
															{
																withCredentials: true,
															}
														)
														.then((res: { data: ICheet[] }) => {
															setCheets(res.data);
															setModalOpen(false);
														})
														.catch((error: unknown) => {
															handleErrors(error, "deleting the cheet", setErrors);
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

export default Cheet;
