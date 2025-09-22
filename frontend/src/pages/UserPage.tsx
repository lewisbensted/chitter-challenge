import React, { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import type { ICheet, IConversation, UserEnhanced } from "../interfaces/interfaces";
import SendCheet from "../components/SendCheet";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import { Box, Typography } from "@mui/material";
import Cheet from "../components/Cheet";
import FlexBox from "../styles/FlexBox";
import useFetchCheets from "../hooks/useFetchCheets";
import useFetchConversations from "../hooks/useFetchConversations";
import CheetModal from "../components/CheetModal";
import { useAuth } from "../contexts/AuthContext";
import { useError } from "../contexts/ErrorContext";
import ScrollGrid from "../styles/ScrollGrid";
import User from "../components/User";
import useFetchUser from "../hooks/useFetchUser";
import MessageModal from "../components/MessageModal";

const UserPage: React.FC = () => {
	const [selectedCheet, setSelectedCheet] = useState<ICheet | null>();
	const [selectedConversation, setSelectedConversation] = useState<IConversation | null>(null);

	const { id } = useParams();

	const { isUserLoading, userEnhanced, setUserEnhanced } = useFetchUser(id);

	const { cheets, isCheetsLoading, cheetsError, hasNextPage, setCheetsError, setCheets, setPage } =
		useFetchCheets(id);

	const {
		conversations,
		isConversationsLoading,
		fetchConversations,
		reloadConversationsTrigger,
		toggleConversationsTrigger,
	} = useFetchConversations();

	useEffect(() => {
		if (!id) return;
		void fetchConversations(false, [id]);
	}, [id, fetchConversations]);

	const isFirstLoad = useRef(true);
	useEffect(() => {
		if (!id) return;
		if (isFirstLoad.current) {
			isFirstLoad.current = false;
			return;
		}
		void fetchConversations(true, [id]);
	}, [id, reloadConversationsTrigger, fetchConversations]);

	const { userId } = useAuth();

	const { setErrors } = useError();

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
				if (isCheetsLoading) return;
				if (cheets[0].isIntersecting && hasNextPage) {
					setPage((page) => page + 1);
				}
			});
			if (cheet) observer.current.observe(cheet);
		},
		[isCheetsLoading, hasNextPage, setPage]
	);

	return (
		<Box>
			{isUserLoading || isConversationsLoading ? (
				<FlexBox>
					<CircularProgress thickness={5} />
				</FlexBox>
			) : (
				<Fragment>
					{userEnhanced ? (
						<User
							userEnhanced={userEnhanced}
							sessionUserId={userId}
							conversation={Array.from(conversations.values())[0]}
							setSelectedConversation={setSelectedConversation}
							onToggleFollow={(arg: UserEnhanced) => {
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

					{cheetsError ? (
						<Typography variant="subtitle1">{cheetsError}</Typography>
					) : (
						<ScrollGrid ref={listRef}>
							{cheets.map((cheet, index) => (
								<Cheet
									ref={cheets.length === index + 1 ? lastCheetRef : undefined}
									key={cheet.uuid}
									cheet={cheet}
									userId={userId}
									setCheets={setCheets}
									setErrors={setErrors}
									isModalView={false}
									numberOfCheets={cheets.length}
									setSelectedCheet={setSelectedCheet}
								/>
							))}
							{isCheetsLoading && (
								<FlexBox>
									<CircularProgress thickness={5} />
								</FlexBox>
							)}
						</ScrollGrid>
					)}
					{userId === id && !cheetsError && (
						<SendCheet
							setCheetsError={setCheetsError}
							setCheets={setCheets}
							setErrors={setErrors}
							triggerScroll={toggleScrollTrigger}
						/>
					)}
				</Fragment>
			)}
			{selectedCheet && (
				<CheetModal
					cheet={selectedCheet}
					isOpen={!!selectedCheet}
					setCheets={setCheets}
					numberOfCheets={cheets.length}
					setSelectedCheet={setSelectedCheet}
				/>
			)}
			{selectedConversation && (
				<MessageModal
					conversation={selectedConversation}
					isOpen={!!selectedConversation}
					setSelectedConversation={setSelectedConversation}
					toggleConversationsTrigger={toggleConversationsTrigger}
				/>
			)}
		</Box>
	);
};

export default UserPage;
