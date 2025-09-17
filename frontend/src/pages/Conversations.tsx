import React, { Fragment, useEffect, useState } from "react";
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
		setConversations,
		fetchConversations,
		isFirstLoad,
		reloadConversationsTrigger,
		toggleConversationsTrigger
	} = useFetchConversations();

	useEffect(() => {
		if (!userId && !isValidateLoading) {
			void navigate("/");
		}
	}, [userId, isValidateLoading, navigate]);

	useEffect(() => {
		void fetchConversations().finally(() => {
			if (isFirstLoad.current) {
				isFirstLoad.current = false;
			}
		});
	}, [reloadConversationsTrigger, fetchConversations]);


	const [selectedConversation, setSelectedConversation] = useState<IConversation | null>(null);

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
								{conversations.map((conversation) => (
									<Conversation
										key={conversation.interlocutorId}
										conversation={conversation}
										setConversations={setConversations}
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
				/>
			)}
		</Box>
	);
};

export default Conversations;
