import React, { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ICheet } from "../interfaces/interfaces";
import IconButton from "@mui/material/IconButton/IconButton";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Close from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog/Dialog";
import { Button, Divider, Grid2, Typography } from "@mui/material";
import Reply from "./Reply";
import Cheet from "./Cheet";
import SendReply from "./SendReply";
import FlexBox from "../styles/FlexBox";
import useFetchReplies from "../hooks/useFetchReplies";
import { useAuth } from "../contexts/AuthContext";
import ScrollGrid from "../styles/ScrollGrid";
import { useIsMounted } from "../utils/isMounted";

interface Props {
	cheet: ICheet;
	isOpen: boolean;
	setCheets: React.Dispatch<React.SetStateAction<ICheet[]>>;
	setSelectedCheet: React.Dispatch<React.SetStateAction<ICheet | null | undefined>>;
}

const CheetModal: React.FC<Props> = ({ cheet, isOpen, setCheets, setSelectedCheet }) => {
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

	const [isCheetLoading, setCheetLoading] = useState<boolean>(false);

	useEffect(() => {
		if (isOpen) {
			void fetchReplies();
		}
	}, [isOpen, fetchReplies]);

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
		(reply: HTMLElement | null) => {
			if (observer.current) observer.current.disconnect();
			observer.current = new IntersectionObserver((replies) => {
				if (isRepliesLoading || repliesError) return;
				if (replies[0].isIntersecting && hasNextPage) {
					setPage((page) => page + 1);
				}
			});
			if (reply) observer.current.observe(reply);
		},
		[isRepliesLoading, hasNextPage, repliesError, setPage]
	);

	const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
	useEffect(() => {
		if (!isRepliesLoading) setHasFetchedOnce(true);
	}, [isRepliesLoading]);

	const isMounted = useIsMounted();

	const message = () => {
		if (repliesError) {
			return page === 0 ? "An unexpected error occured while loading replies." : "Failed to load more replies.";
		} else if (!replies.length) {
			return "No replies to display.";
		}
	};

	return (
		<Dialog open={isOpen} fullWidth maxWidth="md">
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
						setCheets={setCheets}
						isModalView={true}
						setSelectedCheet={setSelectedCheet}
						setCheetLoading={setCheetLoading}
						isPageMounted={isMounted}
					/>
					<Divider />

					<ScrollGrid ref={listRef} height={350}>
						{hasFetchedOnce && (
							<Fragment>
								{((page === 0 && !isRepliesLoading) || page > 0) &&
									replies.length > 0 &&
									replies.map((reply, index) => (
										<Reply
											ref={replies.length === index + 1 ? lastReplyRef : null}
											key={reply.uuid}
											cheetId={cheet.uuid}
											reply={reply}
											setReplies={setReplies}
											isModalMounted={isMounted}
										/>
									))}
								{!isRepliesLoading && (
									<Fragment>
										<Typography variant="subtitle1">{message()}</Typography>
										{repliesError && (
											<FlexBox>
												<Button onClick={() => fetchReplies(true)} variant="contained">
													<Typography variant="button">Retry</Typography>
												</Button>
											</FlexBox>
										)}
									</Fragment>
								)}
							</Fragment>
						)}
						{isRepliesLoading && (
							<FlexBox>
								<CircularProgress thickness={5} />
							</FlexBox>
						)}
					</ScrollGrid>

					{userId && !repliesError && (
						<SendReply
							selectedCheet={cheet}
							isDisabled={isCheetLoading}
							setReplies={setReplies}
							triggerScroll={toggleScrollTrigger}
							repliesLengthRef={repliesLengthRef}
							setRepliesError={setRepliesError}
							setSelectedCheet={setSelectedCheet}
							setCheets={setCheets}
							isModalMounted = { isMounted}
						/>
					)}
				</Grid2>
			</Grid2>
		</Dialog>
	);
};

export default CheetModal;
