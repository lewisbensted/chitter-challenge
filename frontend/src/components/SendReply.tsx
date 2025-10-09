import React, { useState } from "react";
import axios from "axios";
import { type SubmitHandler, useForm } from "react-hook-form";
import type { ICheet, IReply } from "../interfaces/interfaces";
import { serverURL } from "../config/config";
import IconButton from "@mui/material/IconButton/IconButton";
import Reply from "@mui/icons-material/Reply";
import { Grid2, TextField } from "@mui/material";
import FlexBox from "../styles/FlexBox";
import { useError } from "../contexts/ErrorContext";
import { useIsMounted } from "../utils/isMounted";
import LoadingSpinner from "./LoadingSpinner";

interface Props {
	selectedCheet: ICheet;
	isDisabled: boolean;
	setReplies: React.Dispatch<React.SetStateAction<IReply[]>>;
	setErrors: React.Dispatch<React.SetStateAction<string[]>>;
	triggerScroll: React.Dispatch<React.SetStateAction<boolean>>;
	repliesLengthRef: React.MutableRefObject<number>;
	setRepliesError: React.Dispatch<React.SetStateAction<string>>;
	setSelectedCheet: React.Dispatch<React.SetStateAction<ICheet | null | undefined>>;
	setCheets: React.Dispatch<React.SetStateAction<ICheet[]>>;
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
}) => {
	const { register, handleSubmit, reset } = useForm<{ text: string }>();
	const [isLoading, setSubmitLoading] = useState<boolean>(false);

	const { handleErrors } = useError();

	const isMounted = useIsMounted();

	const [pendingReply, setPendingReply] = useState<IReply | null>(null);
	const [pendingError, setPendingError] = useState<unknown>(null);
	const sendReply: SubmitHandler<{ text: string }> = async (data) => {
		try {
			setSubmitLoading(true);
			const newReply = await axios.post<IReply>(`${serverURL}/api/cheets/${selectedCheet.uuid}/replies`, data, {
				withCredentials: true,
			});
			setPendingReply(newReply.data);
		} catch (error) {
			setPendingError(error);
			handleErrors(error, "send reply", isMounted.current);
		} finally {
			setSubmitLoading(false);
		}
	};

	const applyPending = () => {
		if (pendingReply) {
			setReplies((replies) => [pendingReply, ...replies]);
			setPendingReply(null);
			triggerScroll((prev) => !prev);
			if (repliesLengthRef.current === 0) {
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
			setRepliesError("");
			reset();
		}
		if (pendingError) {
			handleErrors(pendingError, "send message");
			setPendingError(null);
		}
	};

	return (
		<FlexBox>
			<Grid2
				container
				component="form"
				onSubmit={handleSubmit(sendReply)}
				width={350}
			>
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
