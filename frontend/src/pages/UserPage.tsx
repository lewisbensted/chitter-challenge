import React, { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import type { ICheet, IConversation, IUserEnhanced } from "../interfaces/interfaces";
import SendCheet from "../components/SendCheet";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import { Box, Button, Typography } from "@mui/material";
import Cheet from "../components/Cheet";
import FlexBox from "../styles/FlexBox";
import useFetchCheets from "../hooks/useFetchCheets";
import useFetchConversations from "../hooks/useFetchConversations";
import CheetModal from "../components/CheetModal";
import { useAuth } from "../contexts/AuthContext";
import ScrollGrid from "../styles/ScrollGrid";
import User from "../components/User";
import useFetchUser from "../hooks/useFetchUser";
import MessageModal from "../components/MessageModal";
import { useIsMounted } from "../utils/isMounted";

const UserPage: React.FC = () => {
	const [selectedCheet, setSelectedCheet] = useState<ICheet | null>();
	const [selectedConversation, setSelectedConversation] = useState<IConversation | null>(null);

	const { id } = useParams();

	const { isUserLoading, userEnhanced, setUserEnhanced, fetchUser } = useFetchUser(id);

	const { cheets, isCheetsLoading, cheetsError, hasNextPage, setCheetsError, setCheets, setPage, page, fetchCheets } =
		useFetchCheets(id);

	const { userId } = useAuth();

	const { conversations, isConversationsLoading, fetchConversations, setConversations, refreshConversations } =
		useFetchConversations();

	const isMounted = useIsMounted();

	useEffect(() => {
		void fetchUser();
	}, [fetchUser]);

	useEffect(() => {
		void fetchCheets();
	}, [fetchCheets]);

	useEffect(() => {
		if (!id || !userId) return;
		void fetchConversations([id]);
	}, [id, userId, fetchConversations]);

	const [scrollTrigger, toggleScrollTrigger] = useState<boolean>(false);
	const listRef = useRef<HTMLDivElement>(null);
	useLayoutEffect(() => {
		requestAnimationFrame(() => {
			if (listRef.current) {
				listRef.current.scrollTo({ top: 0, behavior: "smooth" });
			}
		});
	}, [scrollTrigger]);

	const observer = useRef<IntersectionObserver>();
	const lastCheetRef = useCallback(
		(cheet: HTMLElement | null) => {
			if (observer.current) observer.current.disconnect();
			observer.current = new IntersectionObserver((cheets) => {
				if (isCheetsLoading || cheetsError) return;
				if (cheets[0].isIntersecting && hasNextPage) {
					setPage((page) => page + 1);
				}
			});
			if (cheet) observer.current.observe(cheet);
		},
		[isCheetsLoading, hasNextPage, cheetsError, setPage]
	);

	const userWithConvos = useMemo(() => {
		if (!userEnhanced) return;
		return { ...userEnhanced, conversation: Array.from(conversations.values())[0] ?? null };
	}, [userEnhanced, conversations]);

	const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
	useEffect(() => {
		if (!isCheetsLoading) setHasFetchedOnce(true);
	}, [isCheetsLoading]);

	const message = () => {
		if (cheetsError) {
			return page === 0 ? "An unexpected error occured while loading cheets." : "Failed to load more cheets.";
		} else if (!cheets.length) {
			return "No cheets to display.";
		}
	};

	return (
		<Box>
			{isUserLoading || isConversationsLoading || (isCheetsLoading && !hasFetchedOnce) ? (
				<FlexBox>
					<CircularProgress thickness={5} />
				</FlexBox>
			) : (
				<Fragment>
					{userWithConvos ? (
						<User
							userEnhanced={userWithConvos}
							sessionUserId={userId}
							setSelectedConversation={setSelectedConversation}
							onToggleFollow={(arg: IUserEnhanced) => {
								setUserEnhanced((prev) => (prev ? arg : prev));
							}}
						/>
					) : (
						<Box>
							<Typography variant="subtitle1">
								Failed to load user information - displaying cheets only.
							</Typography>
						</Box>
					)}

					<ScrollGrid ref={listRef}>
						{hasFetchedOnce && (
							<Fragment>
								{((page === 0 && !isCheetsLoading) || page > 0) &&
									cheets.length > 0 &&
									cheets.map((cheet, index) => (
										<Cheet
											ref={cheets.length === index + 1 ? lastCheetRef : null}
											key={cheet.uuid}
											cheet={cheet}
											setCheets={setCheets}
											isModalView={false}
											setSelectedCheet={setSelectedCheet}
											isPageMounted={isMounted}
										/>
									))}
								{!isCheetsLoading && (
									<Fragment>
										<Typography variant="subtitle1">{message()}</Typography>
										{cheetsError && (
											<FlexBox>
												<Button
													onClick={() => {
														void fetchCheets(true);
													}}
													variant="contained"
												>
													<Typography variant="button">Retry</Typography>
												</Button>
											</FlexBox>
										)}
									</Fragment>
								)}
							</Fragment>
						)}

						{isCheetsLoading && (
							<FlexBox>
								<CircularProgress thickness={5} />
							</FlexBox>
						)}
					</ScrollGrid>

					{userId === id && !cheetsError && (
						<SendCheet
							setCheetsError={setCheetsError}
							setCheets={setCheets}
							triggerScroll={toggleScrollTrigger}
							isPageMounted={isMounted}
						/>
					)}
				</Fragment>
			)}
			{selectedCheet && (
				<CheetModal
					cheet={selectedCheet}
					isOpen={!!selectedCheet}
					setCheets={setCheets}
					setSelectedCheet={setSelectedCheet}
				/>
			)}
			{selectedConversation && (
				<MessageModal
					conversation={selectedConversation}
					isOpen={!!selectedConversation}
					setSelectedConversation={setSelectedConversation}
					setConversations={setConversations}
					refreshConversations={refreshConversations}
				/>
			)}
		</Box>
	);
};

export default UserPage;
