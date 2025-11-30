import React, { useCallback, useState } from "react";
import axios from "axios";
import { type SubmitHandler, useForm } from "react-hook-form";
import type { ICheet, IReply } from "../interfaces/interfaces";
import { serverURL } from "../config/config";
import IconButton from "@mui/material/IconButton/IconButton";
import Reply from "@mui/icons-material/Reply";
import { Grid2, TextField } from "@mui/material";
import FlexBox from "../styles/FlexBox";
import { useError } from "../contexts/ErrorContext";
import LoadingSpinner from "./LoadingSpinner";
import { throwApiError } from "../utils/apiResponseError";

interface Props {
	selectedCheet: ICheet;
	isDisabled: boolean;
	setReplies: React.Dispatch<React.SetStateAction<IReply[]>>;
	triggerScroll: React.Dispatch<React.SetStateAction<boolean>>;
	repliesLengthRef: React.MutableRefObject<number>;
	setRepliesError: React.Dispatch<React.SetStateAction<boolean>>;
	setSelectedCheet: React.Dispatch<React.SetStateAction<ICheet | null | undefined>>;
	setCheets: React.Dispatch<React.SetStateAction<ICheet[]>>;
	isModalMounted: React.MutableRefObject<boolean>;
}

const SendReply: React.FC<Props> = ({
	selectedCheet,
	isDisabled,
	setReplies,
	triggerScroll,
	repliesLengthRef,
	setRepliesError,
	setSelectedCheet,
	setCheets,
	isModalMounted,
}) => {
	const { register, handleSubmit, reset } = useForm<{ text: string }>();
	const [isLoading, setSubmitLoading] = useState<boolean>(false);

	const { handleErrors } = useError();

	const [pendingReply, setPendingReply] = useState<IReply | null>(null);
	const [pendingError, setPendingError] = useState<unknown>(null);
	const sendReply: SubmitHandler<{ text: string }> = async (data) => {
		setSubmitLoading(true);
		try {
			const res = await axios.post<IReply>(`${serverURL}/api/cheets/${selectedCheet.uuid}/replies`, data, {
				withCredentials: true,
			});
			const newReply = res.data;
			if (typeof newReply !== "object") throwApiError("object", newReply);
			if (isModalMounted.current) setPendingReply(newReply);
		} catch (error) {
			if (isModalMounted.current) setPendingError(error);
			else handleErrors(error, "send reply", false);
		} finally {
			if (isModalMounted.current) setSubmitLoading(false);
		}
	};

	const applyPending = useCallback(() => {
		if (pendingReply) {
			if (isModalMounted.current) {
				setReplies((replies) => [pendingReply, ...replies]);
				setPendingReply(null);
				triggerScroll((prev) => !prev);
				setRepliesError(false);
				reset();
			}
			if (repliesLengthRef.current === 0) {
				if (isModalMounted.current)
					setSelectedCheet((cheet) => {
						if (!cheet) return cheet;
						return { ...cheet, cheetStatus: { hasReplies: true } };
					});

				setCheets((prevCheets) => {
					const updatedCheets = prevCheets.map((cheet) =>
						cheet.uuid === selectedCheet.uuid ? { ...cheet, cheetStatus: { hasReplies: true } } : cheet
					);
					return updatedCheets;
				});
			}
			repliesLengthRef.current++;
		}
		if (pendingError) {
			handleErrors(pendingError, "send reply", isModalMounted.current);
			if (isModalMounted.current) setPendingError(null);
		}
	}, [
		handleErrors,
		isModalMounted,
		pendingError,
		pendingReply,
		repliesLengthRef,
		reset,
		selectedCheet.uuid,
		setCheets,
		setReplies,
		setRepliesError,
		setSelectedCheet,
		triggerScroll,
	]);

	return (
		<FlexBox>
			<Grid2 container component="form" onSubmit={handleSubmit(sendReply)} width={350}>
				<Grid2 container size={11} paddingRight={2}>
					<TextField {...register("text")} type="text" variant="standard" label="Send reply" />
				</Grid2>
				<Grid2 size={1} container justifyContent="center">
					<LoadingSpinner isLoading={isLoading} onFinished={applyPending}>
						<IconButton type="submit" sx={{ pointerEvents: isDisabled || isLoading ? "none" : undefined }}>
							<Reply fontSize="large" />
						</IconButton>
					</LoadingSpinner>
				</Grid2>
			</Grid2>
		</FlexBox>
	);
};

export default SendReply;
