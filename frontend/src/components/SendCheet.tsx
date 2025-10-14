import React, { useState } from "react";
import axios from "axios";
import { type SubmitHandler, useForm } from "react-hook-form";
import type { ICheet } from "../interfaces/interfaces";
import { useParams } from "react-router-dom";
import { serverURL } from "../config/config";
import IconButton from "@mui/material/IconButton/IconButton";
import Send from "@mui/icons-material/Send";
import FlexBox from "../styles/FlexBox";
import { Grid2, TextField } from "@mui/material";
import { useError } from "../contexts/ErrorContext";
import LoadingSpinner from "./LoadingSpinner";

interface Props {
	setCheets: React.Dispatch<React.SetStateAction<ICheet[]>>;
	setCheetsError: React.Dispatch<React.SetStateAction<boolean>>;
	setErrors: React.Dispatch<React.SetStateAction<string[]>>;
	triggerScroll: React.Dispatch<React.SetStateAction<boolean>>;
}

const SendCheet: React.FC<Props> = ({ setCheets, setCheetsError, triggerScroll }) => {
	const { id } = useParams();
	const { register, handleSubmit, reset } = useForm<{ text: string }>();
	const [isLoading, setSubmitLoading] = useState<boolean>(false);

	const { handleErrors } = useError();

	const [pendingCheet, setPendingCheet] = useState<ICheet | null>(null);
	const [pendingError, setPendingError] = useState<unknown>(null);
	const sendCheet: SubmitHandler<{ text: string }> = async (data) => {
		try {
			setSubmitLoading(true);
			const newCheet = await axios.post<ICheet>(
				`${serverURL + "/api" + (id ? `/users/${id}` : "")}/cheets`,
				data,
				{
					withCredentials: true,
				}
			);
			setPendingCheet(newCheet.data);
		} catch (error) {
			setPendingError(error);
		} finally {
			setSubmitLoading(false);
		}
	};

	const applyPending = () => {
		if (pendingCheet) {
			setCheets((prev) => [pendingCheet, ...prev]);
			setPendingCheet(null);
			triggerScroll((prev) => !prev);
			setCheetsError(false);
			reset();
		}
		if (pendingError) {
			handleErrors(pendingError, "send cheet");
			setPendingError(null);
		}
	};

	return (
		<FlexBox>
			<Grid2
				container
				component="form"
				onSubmit={handleSubmit(sendCheet)}
				width={400}
			>
				<Grid2 container size={11} paddingRight={2}>
					<TextField {...register("text")} type="text" variant="standard" label="Send cheet" />
				</Grid2>

				<Grid2 size={1} container justifyContent="center">
					<LoadingSpinner isLoading={isLoading} onFinished={applyPending}>
						<IconButton type="submit" sx={{ pointerEvents: isLoading ? "none" : undefined }}>
							<Send fontSize="large" />
						</IconButton>
					</LoadingSpinner>
				</Grid2>
			</Grid2>
		</FlexBox>
	);
};

export default SendCheet;
