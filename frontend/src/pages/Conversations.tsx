import React, { Fragment, useEffect, useRef, useState } from "react";
import ErrorModal from "../components/ErrorModal";
import Conversation from "../components/Conversation";
import { Box, CircularProgress, Grid2, Typography } from "@mui/material";
import FlexBox from "../styles/FlexBox";
import useFetchConversations from "../hooks/useFetchConversations";
import { IConversation } from "../interfaces/interfaces";
import MessageModal from "../components/MessageModal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useError } from "../contexts/ErrorContext";

const Conversations: React.FC = () => {
	const { errors, clearErrors } = useError();
	const [reloadConversationsTrigger, toggleConversationsTrigger] = useState<boolean>(false);

	const navigate = useNavigate();

	const { userId, isValidateLoading, isComponentLoading, setComponentLoading, fetchUnread } = useAuth();

	const {
		conversations,
		isConversationsLoading,
		conversationsError,
		setConversationsError,
		setConversations,
		fetchConversations,
	} = useFetchConversations();

	useEffect(() => {
		if (!userId && !isValidateLoading) {
			void navigate("/");
		}
	}, [userId, isValidateLoading, navigate]);

	const isFirstLoad = useRef(true);
	const [reloadUnreadTrigger, toggleUnreadTrigger] = useState<boolean>(false);
	useEffect(() => {
		if (isFirstLoad.current) {
			isFirstLoad.current = false;
			return;
		}
		void fetchUnread();
	}, [reloadUnreadTrigger, fetchUnread]);

	useEffect(() => {
		void fetchConversations();
	}, [reloadConversationsTrigger, setConversationsError, fetchConversations]);

	const [selectedConversation, setSelectedConversation] = useState<IConversation | null>();

	return (
		<Box>
			<ErrorModal
				errors={errors}
				closeModal={clearErrors}
			/>

			{isConversationsLoading || isValidateLoading ? (
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
							<Grid2 sx={{ overflowY: "auto", maxHeight: 500, scrollbarGutter: "stable" }}>
								{conversations.map((conversation) => (
									<Conversation
										key={conversation.interlocutorId}
										userId={userId}
										conversation={conversation}
										isDisabled={isComponentLoading}
										setConversations={setConversations}
										setSelectedConversation={setSelectedConversation}
									/>
								))}
							</Grid2>
						)}
					</Fragment>
				)
			)}
			{selectedConversation && (
				<MessageModal
					userId={userId}
					conversation={selectedConversation}
					isOpen={!!selectedConversation}
					isDisabled={isComponentLoading || isConversationsLoading}
					setComponentLoading={setComponentLoading}
					setSelectedConversation={setSelectedConversation}
					setConversations={setConversations}
					toggleConversationsTrigger={toggleConversationsTrigger}
					toggleUnreadTrigger={toggleUnreadTrigger}
				/>
			)}
		</Box>
	);
};

export default Conversations;
