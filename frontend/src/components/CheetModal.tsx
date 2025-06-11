import React, { useCallback, useEffect, useRef, useState } from "react";
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

interface Props {
	userId?: string | null;
	cheet: ICheet;
	isOpen: boolean;
	closeModal: () => void;
	setCheets: React.Dispatch<React.SetStateAction<ICheet[]>>;
	isComponentLoading: boolean;
	setComponentLoading: React.Dispatch<React.SetStateAction<boolean>>;
	numberOfCheets: number;
	reloadTrigger: boolean;
	toggleReloadTrigger: React.Dispatch<React.SetStateAction<boolean>>;
}

const CheetModal: React.FC<Props> = ({
	userId,
	cheet,
	isOpen,
	closeModal,
	setCheets,
	setComponentLoading,
	isComponentLoading,
	numberOfCheets,
	reloadTrigger,
	toggleReloadTrigger,
}) => {
	const [errors, setErrors] = useState<string[]>([]);
	const [page, setPage] = useState<number>(0);

	const {
		replies,
		repliesError,
		isRepliesLoading,
		repliesLengthRef,
		hasNextPage,
		setRepliesError,
		setReplies,
		fetchReplies,
	} = useFetchReplies();

	useEffect(() => {
		if (isOpen) {
			void fetchReplies(cheet.uuid);
		}
	}, [isOpen, page, cheet.uuid, setComponentLoading, fetchReplies]);

	const listRef = useRef<HTMLDivElement>(null);
	const scrollToTop = () => {
		if (listRef.current) {
			listRef.current.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	const observer = useRef<IntersectionObserver>();
	const lastReplyRef = useCallback(
		(cheet: HTMLElement | null) => {
			if (isRepliesLoading) return;
			if (observer.current) observer.current.disconnect();
			observer.current = new IntersectionObserver((cheets) => {
				if (cheets[0].isIntersecting && hasNextPage) {
					setPage((page) => page + 1);
				}
			});
			if (cheet) observer.current?.observe(cheet);
		},
		[isRepliesLoading, hasNextPage]
	);

	return (
		<ThemeProvider theme={theme}>
			<Dialog open={isOpen} fullWidth maxWidth="md">
				<ErrorModal
					errors={errors}
					closeModal={() => {
						setErrors([]);
					}}
				/>
				<Grid2 container marginInline={2} marginTop={1}>
					<Grid2 size={11} />
					<Grid2 size={1} display="flex" justifyContent="flex-end">
						<IconButton onClick={closeModal} disabled={isComponentLoading} color="primary">
							<Close />
						</IconButton>
					</Grid2>
					<Grid2 marginInline={3} size={12}>
						<Cheet
							cheet={cheet}
							userId={userId}
							setCheets={setCheets}
							setErrors={setErrors}
							setComponentLoading={setComponentLoading}
							isComponentLoading={isComponentLoading}
							isModalView={true}
							closeModal={closeModal}
							numberOfCheets={numberOfCheets}
							reloadTrigger={reloadTrigger}
							toggleReloadTrigger={toggleReloadTrigger}
						/>
						<Divider />

						{repliesError ? (
							<Typography variant="subtitle1">{repliesError}</Typography>
						) : (
							<Grid2 ref={listRef} sx={{ overflowY: "auto", maxHeight: 390 }}>
								{replies.map((reply, index) => (
									<Reply
										ref={replies.length === index + 1 ? lastReplyRef : null}
										key={reply.uuid}
										isComponentLoading={isComponentLoading}
										userId={userId}
										cheetId={cheet.uuid}
										reply={reply}
										setReplies={setReplies}
										setErrors={setErrors}
										setComponentLoading={setComponentLoading}
										numberOfReplies={replies.length}
									/>
								))}
								{isRepliesLoading ? (
									<FlexBox>
										<CircularProgress thickness={5} />
									</FlexBox>
								) : null}
							</Grid2>
						)}

						{userId && !repliesError ? (
							<SendReply
								cheetId={cheet.uuid}
								isDisabled={isComponentLoading || isRepliesLoading}
								setReplies={setReplies}
								setErrors={setErrors}
								setComponentLoading={setComponentLoading}
								scroll={scrollToTop}
								repliesLengthRef={repliesLengthRef}
								reloadTrigger={reloadTrigger}
								toggleReloadTrigger={toggleReloadTrigger}
								setRepliesError={setRepliesError}
							/>
						) : null}
					</Grid2>
				</Grid2>
			</Dialog>
		</ThemeProvider>
	);
};

export default CheetModal;
