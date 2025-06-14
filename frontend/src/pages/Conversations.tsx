import React, { Fragment, useEffect, useState } from "react";
import Layout from "./Layout";
import ErrorModal from "../components/ErrorModal";
import Conversation from "../components/Conversation";
import { handleErrors } from "../utils/handleErrors";
import { Box, CircularProgress, Grid2, Typography } from "@mui/material";
import FlexBox from "../styles/FlexBox";
import useValidateUser from "../hooks/useValidateUser";
import useFetchConversations from "../hooks/useFetchConversations";
import { IConversation } from "../interfaces/interfaces";
import MessageModal from "../components/MessageModal";

const Conversations: React.FC = () => {
	const [isComponentLoading, setComponentLoading] = useState<boolean>(false);
	const [errors, setErrors] = useState<string[]>([]);
	const [reloadTrigger, toggleReloadTrigger] = useState<boolean>(false);

	const { userId, isValidateLoading, setUserId, setValidateLoading, validateUser } = useValidateUser();

	const {
		isUnreadMessages,
		conversations,
		isConversationsLoading,
		conversationsError,
		setConversationsError,
		setConversations,
		fetchData,
		conversationErrorOnClose,
	} = useFetchConversations();

	useEffect(() => {
		void validateUser(
			(error) => {
				handleErrors(error, "validating user", setErrors);
			},
			{ requiresAuthorisation: true }
		);
	}, [validateUser]);

	useEffect(() => {
		if (!userId) return;
		void fetchData(
			(error) => {
				handleErrors(error, "fetching conversations", setErrors);
			},
			setComponentLoading,
			{}
		);
	}, [userId, reloadTrigger, setConversationsError, fetchData]);

	const [selectedConversation, setSelectedConversation] = useState<IConversation | null>();

	return (
		<Layout
			isValidationLoading={isValidateLoading}
			isComponentLoading={isComponentLoading || isConversationsLoading}
			setPageLoading={setValidateLoading}
			userId={userId}
			setUserId={setUserId}
			isUnreadMessages={isUnreadMessages}
		>
			<Box>
				<ErrorModal
					errors={errors}
					closeModal={() => {
						setErrors([]);
						if (conversationErrorOnClose.current) {
							setConversationsError("An unexpected error occured while loading conversations.");
							conversationErrorOnClose.current = false;
						}
					}}
				/>

				{isConversationsLoading || isValidateLoading ? (
					<FlexBox>
						<CircularProgress thickness={5} />
					</FlexBox>
				) : userId ? (
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
										isComponentLoading={isComponentLoading}
										setComponentLoading={setComponentLoading}
										setConversations={setConversations}
										reloadTrigger={reloadTrigger}
										toggleReloadTrigger={toggleReloadTrigger}
										conversationErrorOnClose={conversationErrorOnClose}
										setSelectedConversation={setSelectedConversation}
									/>
								))}
							</Grid2>
						)}
					</Fragment>
				) : null}
				{selectedConversation && (
					<MessageModal
						userId={userId}
						conversation={selectedConversation}
						isOpen={!!selectedConversation}
						isComponentLoading={isComponentLoading}
						setComponentLoading={setComponentLoading}
						closeModal={() => {
							setSelectedConversation(null);
						}}
						setConversations={setConversations}
						reloadTrigger={reloadTrigger}
						toggleReloadTrigger={toggleReloadTrigger}
						unread={selectedConversation.unread}
						onUserPage={false}
						conversationErrorOnClose={conversationErrorOnClose}
					/>
				)}
			</Box>
		</Layout>
	);
};

export default Conversations;
