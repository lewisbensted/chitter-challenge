import React, { Fragment, useEffect, useState } from "react";
import Conversation from "../components/Conversation";
import { Box, CircularProgress, Typography } from "@mui/material";
import FlexBox from "../styles/FlexBox";
import useFetchConversations from "../hooks/useFetchConversations";
import type { IConversation } from "../interfaces/interfaces";
import MessageModal from "../components/MessageModal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useError } from "../contexts/ErrorContext";
import { useLayout } from "../contexts/LayoutContext";
import ScrollGrid from "../styles/ScrollGrid";

const Conversations: React.FC = () => {
	const { errors, clearErrors } = useError();

	const navigate = useNavigate();

	const { userId, isValidateLoading, isComponentLoading } = useAuth();

	useLayout();

	const {
		conversations,
		isConversationsLoading,
		conversationsError,
		setConversations,
		toggleConversationsTrigger
	} = useFetchConversations();

	useEffect(() => {
		if (!userId && !isValidateLoading) {
			void navigate("/");
		}
	}, [userId, isValidateLoading, navigate]);


	const [selectedConversation, setSelectedConversation] = useState<IConversation | null>();

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
										isDisabled={isComponentLoading}
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
					isDisabled={isComponentLoading || isConversationsLoading}
					setSelectedConversation={setSelectedConversation}
					setConversations={setConversations}
					toggleConversationsTrigger={toggleConversationsTrigger}
				/>
			)}
		</Box>
	);
};

export default Conversations;
