import React, { Fragment, useEffect, useRef, useState } from "react";
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

	const {
		conversations,
		isConversationsLoading,
		conversationsError,
		fetchConversations,
		reloadConversationsTrigger,
		toggleConversationsTrigger,
	} = useFetchConversations();

	const [selectedConversation, setSelectedConversation] = useState<IConversation | null>(null);

	const selectedConversationRef = useRef<IConversation | null>(selectedConversation);
	useEffect(() => {
		selectedConversationRef.current = selectedConversation;
	}, [selectedConversation]);

	useEffect(() => {
		if (!userId && !isValidateLoading) {
			void navigate("/");
		}
	}, [userId, isValidateLoading, navigate]);

	useEffect(() => {
		void fetchConversations();
	}, [fetchConversations]);

	const isFirstLoad = useRef(true);
	useEffect(() => {
		if (isFirstLoad.current) {
			isFirstLoad.current = false;
			return;
		}
		void fetchConversations(
			selectedConversationRef.current ? [selectedConversationRef.current.interlocutorId] : undefined,
			true,
			!!selectedConversationRef.current,
			true
		);
	}, [reloadConversationsTrigger, fetchConversations]);

	return (
		<Box>
			{isConversationsLoading ? (
				<FlexBox>
					<CircularProgress thickness={5} />
				</FlexBox>
			) : (
				userId && (
					<Fragment>
						<Typography variant="h4">Messages</Typography>
						{conversationsError ? (
							<Typography variant="subtitle1">{conversationsError}</Typography>
						) : (
							<ScrollGrid>
								{Array.from(conversations.values()).map((conversation) => (
									<Conversation
										key={conversation.interlocutorId}
										conversation={conversation}
										setSelectedConversation={setSelectedConversation}
									/>
								))}
							</ScrollGrid>
						)}
					</Fragment>
				)
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
