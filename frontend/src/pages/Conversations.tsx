import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Conversation from "../components/Conversation";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import FlexBox from "../styles/FlexBox";
import useFetchConversations from "../hooks/useFetchConversations";
import type { IConversation } from "../interfaces/interfaces";
import MessageModal from "../components/MessageModal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ScrollGrid from "../styles/ScrollGrid";

const Conversations: React.FC = () => {
	const navigate = useNavigate();

	const { userId } = useAuth();

	const listRef = useRef<HTMLDivElement>(null);

	const {
		conversations,
		isConversationsLoading,
		conversationsError,
		fetchConversations,
		hasNextPage,
		setPage,
		page,
		setConversations,
		refreshConversations,
	} = useFetchConversations();

	const [selectedConversation, setSelectedConversation] = useState<IConversation | null>(null);

	const selectedConversationRef = useRef<IConversation | null>(selectedConversation);
	useEffect(() => {
		selectedConversationRef.current = selectedConversation;
	}, [selectedConversation]);

	useEffect(() => {
		if (!userId) {
			void navigate("/");
		}
	}, [userId, navigate]);

	useEffect(() => {
		if (!userId) return;
		void fetchConversations();
	}, [userId, fetchConversations]);

	const convosArray = Array.from(conversations.values());

	const observer = useRef<IntersectionObserver>();
	const lastConversationRef = useCallback(
		(cheet: HTMLElement | null) => {
			if (observer.current) observer.current.disconnect();
			observer.current = new IntersectionObserver((conversations) => {
				if (isConversationsLoading || conversationsError) return;
				if (conversations[0].isIntersecting && hasNextPage) {
					setPage((page) => page + 1);
				}
			});
			if (cheet) observer.current.observe(cheet);
		},
		[isConversationsLoading, conversationsError, hasNextPage, setPage]
	);

	const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
	useEffect(() => {
		if (!isConversationsLoading) setHasFetchedOnce(true);
	}, [isConversationsLoading]);

	const message = () => {
		if (conversationsError) {
			return page === 0
				? "An unexpected error occured while loading conversations."
				: "Failed to load more conversations.";
		} else if (!conversations.size) {
			return "No conversations to display.";
		}
	};

	return (
		<Box>
			{userId && (
				<Fragment>
					<Typography variant="h4">Conversations</Typography>
					<ScrollGrid ref={listRef}>
						{hasFetchedOnce && (
							<Fragment>
								{((page === 0 && !isConversationsLoading) || page > 0) &&
									convosArray.length > 0 &&
									convosArray.map((conversation, index) => (
										<Conversation
											ref={convosArray.length === index + 1 ? lastConversationRef : null}
											key={conversation.interlocutorId}
											conversation={conversation}
											setSelectedConversation={setSelectedConversation}
										/>
									))}
								{!isConversationsLoading && (
									<Fragment>
										<Typography variant="subtitle1">{message()}</Typography>
										{conversationsError && (
											<FlexBox>
												<Button
													onClick={() => fetchConversations(undefined, true)}
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

						{isConversationsLoading && (
							<FlexBox>
								<CircularProgress thickness={5} />
							</FlexBox>
						)}
					</ScrollGrid>
				</Fragment>
			)}
			{selectedConversation && (
				<MessageModal
					conversation={selectedConversation}
					isOpen={!!selectedConversation}
					setSelectedConversation={setSelectedConversation}
					convosPage={true}
					setConversations={setConversations}
					refreshConversations = {refreshConversations}
				/>
			)}
		</Box>
	);
};

export default Conversations;
