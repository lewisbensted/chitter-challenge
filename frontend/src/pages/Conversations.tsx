import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Layout from "./Layout";
import { IConversation } from "../utils/interfaces";
import ErrorModal from "../components/ErrorModal";
import { serverURL } from "../utils/serverURL";
import Conversation from "../components/Conversation";
import { useNavigate } from "react-router-dom";
import { handleErrors } from "../utils/handleErrors";
import { Box, CircularProgress, Grid2, Typography } from "@mui/material";
import FlexBox from "../styles/FlexBox";
import validateUser from "../utils/validateUser";

const Conversations: React.FC = () => {
	const [userId, setUserId] = useState<string>();
	const [isComponentLoading, setComponentLoading] = useState<boolean>(false);
	const [conversations, setConversations] = useState<IConversation[]>();
	const [errors, setErrors] = useState<string[]>([]);
	const [conversationsError, setConversationsError] = useState<string>();
	const [reloadTrigger, toggleReloadTrigger] = useState<boolean>(false);
	const [isUnreadMessages, setUnreadMessages] = useState<boolean>();
	const navigate = useNavigate();

	const [isValidateLoading, setValidateLoading] = useState<boolean>(true);

	useEffect(() => {
		void validateUser(
			(arg: string) => {
				setUserId(arg);
			},
			() => {
				navigate("/");
			},
			setValidateLoading,
			setErrors
		);
	}, []);

	const [isConversationsLoading, setConversationsLoading] = useState(true);
	useEffect(() => {
		if (!userId) return;

		const fetchConversations = async () => {
			try {
				const res = await axios.get<IConversation[]>(`${serverURL}/conversations`, { withCredentials: true });
				setConversations(res.data);
			} catch {
				setConversationsError("An unexpected error occured while loading conversations.");
			}
		};

		const fetchUnread = async () => {
			const res = await axios.get<boolean>(`${serverURL}/messages/unread`, { withCredentials: true });
			setUnreadMessages(res.data);
		};

		const loadData = async () => {
			try {
				setComponentLoading(true);
				await Promise.all([fetchConversations(), fetchUnread()]);
			} catch (error: unknown) {
				handleErrors(error, "loading messages", setErrors);
			} finally {
				setTimeout(() => setComponentLoading(false));
				setConversationsLoading(false);
			}
		};

		void loadData();
	}, [userId, reloadTrigger]);

	return (
		<Layout
			isPageLoading={isValidateLoading}
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
				<Typography variant="h4">Messages</Typography>
				{isConversationsLoading || isValidateLoading ? (
					<FlexBox>
						<CircularProgress thickness={5} />
					</FlexBox>
				) : userId ? (
					conversationsError ? (
						conversationsError
					) : (
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
					)
				) : (
					"Error loading conversations."
				)}
			</Box>
		</Layout>
	);
};

export default Conversations;
