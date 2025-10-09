import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Conversation from "../components/Conversation";
import { Box, CircularProgress, Typography } from "@mui/material";
import FlexBox from "../styles/FlexBox";
import useFetchConversations from "../hooks/useFetchConversations";
import type { IConversation } from "../interfaces/interfaces";
import MessageModal from "../components/MessageModal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ScrollGrid from "../styles/ScrollGrid";

const Conversations: React.FC = () => {
	const navigate = useNavigate();

	const { userId, isValidateLoading } = useAuth();

	const listRef = useRef<HTMLDivElement>(null);

	const {
		conversations,
		isConversationsLoading,
		conversationsError,
		fetchConversations,
		reloadConversationsTrigger,
		toggleConversationsTrigger,
		hasNextPage,
		setPage,
		page,
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

	const isFirstLoad = useRef(true);
	useEffect(() => {
		if (!userId || isValidateLoading) return;
		if (isFirstLoad.current) {
			isFirstLoad.current = false;
			return;
		}
		void fetchConversations(
			selectedConversationRef.current ? [selectedConversationRef.current.interlocutorId] : undefined,
			true,
			true
		);
	}, [userId, isValidateLoading, reloadConversationsTrigger, fetchConversations]);

	const convosArray = Array.from(conversations.values());

	const observer = useRef<IntersectionObserver>();
	const lastConversationRef = useCallback(
		(cheet: HTMLElement | null) => {
			if (observer.current) observer.current.disconnect();
			observer.current = new IntersectionObserver((cheets) => {
				if (isConversationsLoading) return;
				if (cheets[0].isIntersecting && hasNextPage) {
					setPage((page) => page + 1);
				}
			});
			if (cheet) observer.current.observe(cheet);
		},
		[isConversationsLoading, hasNextPage, setPage]
	);

	const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
	useEffect(() => {
		if (!isConversationsLoading) setHasFetchedOnce(true);
	}, [isConversationsLoading]);

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
								{page === 0 && !isConversationsLoading && !convosArray.length && (
									<Typography variant="subtitle1">
										{conversationsError ?? "No conversations to display."}
									</Typography>
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
					toggleConversationsTrigger={toggleConversationsTrigger}
					convosPage={true}
				/>
			)}
		</Box>
	);
};

export default Conversations;
