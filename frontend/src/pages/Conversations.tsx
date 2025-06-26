import React, { Fragment, useEffect, useRef, useState } from "react";
import Layout from "./Layout";
import ErrorModal from "../components/ErrorModal";
import Conversation from "../components/Conversation";
import { handleErrors, logErrors } from "../utils/handleErrors";
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
		fetchConversations,
		fetchUnread,
		setConversationsLoading,
	} = useFetchConversations();

	useEffect(() => {
		void validateUser(
			(error) => {
				handleErrors(error, "validating user", setErrors);
			},
			{ requiresAuthorisation: true }
		);
	}, [validateUser]);

	const updateUnreadRef = useRef<boolean>(true);

	useEffect(() => {
		if (!userId) return;
		const getConversations = async () => {
			try {
				setComponentLoading(true);
				await Promise.all([updateUnreadRef.current ? fetchUnread() : null, fetchConversations()]);
			} catch (error) {
				logErrors(error);
				setConversationsError("An unexpected error occured while loading conversations.");
			} finally {
				setComponentLoading(false);
				setConversationsLoading(false);
			}
		};
		void getConversations();
	}, [userId, reloadConversationsTrigger, setConversationsError]);

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
						toggleReloadTrigger={toggleConversationsTrigger}
						onUserPage={false}
						updateUnreadRef={updateUnreadRef}
					/>
				)}
			</Box>
		</Layout>
	);
};

export default Conversations;
