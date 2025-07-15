import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ICheet } from "../interfaces/interfaces";
import ErrorModal from "./ErrorModal";
import IconButton from "@mui/material/IconButton/IconButton";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Close from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog/Dialog";
import { Divider, Grid2, ThemeProvider, Typography } from "@mui/material";
import Reply from "./Reply";
import theme from "../styles/theme";
import Cheet from "./Cheet";
import SendReply from "./SendReply";
import FlexBox from "../styles/FlexBox";
import useFetchReplies from "../hooks/useFetchReplies";
import { useError } from "../contexts/ErrorContext";
import { useAuth } from "../contexts/AuthContext";
import ScrollGrid from "../styles/ScrollGrid";

interface Props {
	cheet: ICheet;
	cheets: ICheet[];
	isOpen: boolean;
	setCheets: React.Dispatch<React.SetStateAction<ICheet[]>>;
	isDisabled: boolean;
	numberOfCheets: number;
	setSelectedCheet: React.Dispatch<React.SetStateAction<ICheet | null | undefined>>;
}

const CheetModal: React.FC<Props> = ({ cheet, isOpen, setCheets, isDisabled, numberOfCheets, setSelectedCheet }) => {
	const { errors, setErrors, clearErrors } = useError();
	const { userId } = useAuth();

	const {
		replies,
		repliesError,
		isRepliesLoading,
		repliesLengthRef,
		hasNextPage,
		setRepliesError,
		setReplies,
		setPage,
		fetchReplies,
		page,
	} = useFetchReplies(cheet.uuid);

	useEffect(() => {
		if (isOpen) {
			void fetchReplies(page === 0 ? 10 : 5);
		}
	}, [isOpen, page, fetchReplies]);

	const listRef = useRef<HTMLDivElement>(null);
	const [scrollTrigger, toggleScrollTrigger] = useState<boolean>(false);
	useLayoutEffect(() => {
		requestAnimationFrame(() => {
			if (listRef.current) {
				listRef.current.scrollTo({ top: 0, behavior: "smooth" });
			}
		});
	}, [scrollTrigger]);

	const observer = useRef<IntersectionObserver>();
	const lastReplyRef = useCallback(
		(cheet: HTMLElement | null) => {
			if (observer.current) observer.current.disconnect();
			observer.current = new IntersectionObserver((cheets) => {
				if (isRepliesLoading) return;
				if (cheets[0].isIntersecting && hasNextPage) {
					setPage((page) => page + 1);
				}
			});
			if (cheet) observer.current.observe(cheet);
		},
		[isRepliesLoading, hasNextPage, setPage]
	);

	return (
		<ThemeProvider theme={theme}>
			<Dialog open={isOpen} fullWidth maxWidth="md">
				<ErrorModal errors={errors} closeModal={clearErrors} />
				<Grid2 container marginInline={2} marginTop={1}>
					<Grid2 size={11} />
					<Grid2 size={1} display="flex" justifyContent="flex-end">
						<IconButton
							onClick={() => {
								setSelectedCheet(null);
							}}
						>
							<Close />
						</IconButton>
					</Grid2>
					<Grid2 marginInline={3} size={12}>
						<Cheet
							cheet={cheet}
							userId={userId}
							setCheets={setCheets}
							setErrors={setErrors}
							isDisabled={isDisabled || isRepliesLoading}
							isModalView={true}
							numberOfCheets={numberOfCheets}
							setSelectedCheet={setSelectedCheet}
						/>
						<Divider />

						{repliesError ? (
							<Typography variant="subtitle1">{repliesError}</Typography>
						) : (
							<ScrollGrid ref={listRef} height={350}>
								{replies.map((reply, index) => (
									<Reply
										ref={replies.length === index + 1 ? lastReplyRef : null}
										key={reply.uuid}
										isDisabled={isDisabled || isRepliesLoading}
										cheetId={cheet.uuid}
										reply={reply}
										setReplies={setReplies}
										setErrors={setErrors}
										numberOfReplies={replies.length}
									/>
								))}
								{isRepliesLoading && (
									<FlexBox>
										<CircularProgress thickness={5} />
									</FlexBox>
								)}
							</ScrollGrid>
						)}

						{userId && !repliesError && (
							<SendReply
								selectedCheet={cheet}
								isDisabled={isDisabled || isRepliesLoading}
								setReplies={setReplies}
								setErrors={setErrors}
								triggerScroll={toggleScrollTrigger}
								repliesLengthRef={repliesLengthRef}
								setRepliesError={setRepliesError}
								setSelectedCheet={setSelectedCheet}
								setCheets={setCheets}
							/>
						)}
					</Grid2>
				</Grid2>
			</Dialog>
		</ThemeProvider>
	);
};

export default CheetModal;
