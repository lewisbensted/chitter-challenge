import React, { Fragment, useEffect, useRef, useState } from "react";
import axios from "axios";
import Layout from "./Layout";
import { IConversation } from "../interfaces/interfaces";
import ErrorModal from "../components/ErrorModal";
import { serverURL } from "../config/config";
import Conversation from "../components/Conversation";
import { handleErrors } from "../utils/handleErrors";
import { Box, CircularProgress, Grid2, Typography } from "@mui/material";
import FlexBox from "../styles/FlexBox";
import useValidateUser from "../hooks/useValidateUser";
import useFetchConversations from "../hooks/useFetchConversations";

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
	} = useFetchConversations();

	useEffect(() => {
		void validateUser(
			(error) => {
				handleErrors(error, "fetching page information", setErrors);
			},
			{ requiresAuthorisation: true }
		);
	}, [validateUser]);

	useEffect(() => {
		if (!userId) return;

		void fetchData(
			() => {
				setConversationsError("j");
			},
			setComponentLoading,
			{}
		);
	}, [userId, reloadTrigger]);

	return (
		<Layout
			isValidationLoding={isValidateLoading}
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
					conversationsError ? (
						conversationsError
					) : (
						<Fragment>
							<Typography variant="h4">Messages</Typography>
							<Grid2 sx={{ overflowY: "auto", maxHeight: 500, scrollbarGutter: "stable" }}>
								{conversations?.map((conversation) => (
									<Conversation
										key={conversation.interlocutorId}
										userId={userId}
										conversation={conversation}
										isComponentLoading={isComponentLoading}
										setComponentLoading={setComponentLoading}
										setConversations={setConversations}
										reloadTrigger={reloadTrigger}
										toggleReloadTrigger={toggleReloadTrigger}
									/>
								))}
							</Grid2>
						</Fragment>
					)
				) : null}
			</Box>
		</Layout>
	);
};

export default Conversations;
