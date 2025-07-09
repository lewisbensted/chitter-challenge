import React, { Fragment, useEffect, useRef, useState } from "react";
import Layout from "./Layout";
import ErrorModal from "../components/ErrorModal";
import Conversation from "../components/Conversation";
import { Box, CircularProgress, Grid2, Typography } from "@mui/material";
import FlexBox from "../styles/FlexBox";
import useValidateUser from "../hooks/useValidateUser";
import useFetchConversations from "../hooks/useFetchConversations";
import { IConversation } from "../interfaces/interfaces";
import MessageModal from "../components/MessageModal";

const Conversations: React.FC = () => {
	const [isComponentLoading, setComponentLoading] = useState<boolean>(false);
	const [errors, setErrors] = useState<string[]>([]);
	const [reloadConversationsTrigger, toggleConversationsTrigger] = useState<boolean>(false);

	const { userId, isValidateLoading, setUserId, setValidateLoading, validateUser } = useValidateUser();

	const {
		isUnreadMessages,
		conversations,
		isConversationsLoading,
		conversationsError,
		setConversationsError,
		setConversations,
		fetchConversationsData,
	} = useFetchConversations();

	useEffect(() => {
		void validateUser(setErrors, { requiresAuthorisation: true });
	}, [validateUser]);

	const updateUnreadRef = useRef<boolean>(true);

	useEffect(() => {
		if (!userId) return;
		void fetchConversationsData(updateUnreadRef);
	}, [userId, reloadConversationsTrigger, setConversationsError, fetchConversationsData]);

	const [selectedConversation, setSelectedConversation] = useState<IConversation | null>();

	return (
		<Layout
			isValidationLoading={isValidateLoading || isConversationsLoading}
			isDisabled={isComponentLoading}
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
					}}
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
						closeModal={() => {
							setSelectedConversation(null);
						}}
						setConversations={setConversations}
						toggleReloadTrigger={toggleConversationsTrigger}
						updateUnreadRef={updateUnreadRef}
					/>
				)}
			</Box>
		</Layout>
	);
};

export default Conversations;
