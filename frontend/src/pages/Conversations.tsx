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

const Conversations: React.FC = () => {
	const [userId, setUserId] = useState<string>();
	const [isPageLoading, setPageLoading] = useState<boolean>(true);
	const [isComponentLoading, setComponentLoading] = useState<boolean>(false);
	const [conversations, setConversations] = useState<IConversation[]>();
	const [errors, setErrors] = useState<string[]>([]);
	const [conversationsError, setConversationsError] = useState<string>();
	const [reloadTrigger, toggleReloadTrigger] = useState<boolean>(false);
	const [isUnreadMessages, setUnreadMessages] = useState<boolean>();
	const navigate = useNavigate();

	const [isValidateLoading, setValidateLoading] = useState<boolean>(true);
	useEffect(() => {
		const validateUser = async () => {
			try {
				const res = await axios.get<string>(`${serverURL}/validate`, { withCredentials: true });
				setUserId(res.data);
			} catch (error) {
				if (axios.isAxiosError(error) && error.response?.status === 401) {
					navigate("/");
				} else {
					handleErrors(error, "authenticating the user", setErrors);
				}
			} finally {
				setValidateLoading(false);
			}
		};
		validateUser();
	}, []);

	const [isConversationsLoading, setConversationsLoading] = useState(true);
	useEffect(() => {
		if (!userId) return;
		const fetchConversations = async () => {
			try {
				const res = await axios.get(`${serverURL}/conversations`, { withCredentials: true });
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
				await fetchConversations();
				await fetchUnread();
			} catch (error: unknown) {
				handleErrors(error, "loading messages", setErrors);
			} finally {
				setTimeout(()=>setComponentLoading(false));
				setConversationsLoading(false);
			}
		};

		loadData();
	}, [userId, reloadTrigger]);

	// useEffect(() => {
	// 	if (userId) {
	// 		void (async () => {
	// 			await axios
	// 				.get(`${serverURL}/messages/unread`, { withCredentials: true })
	// 				.then((res: { data: boolean }) => {
	// 					setUnreadMessages(res.data);
	// 				});
	// 			setComponentLoading(false);
	// 			setPageLoading(false);
	// 		})();
	// 	}
	// }, [conversations, userId]);

	return (
		<Layout
			isPageLoading={isConversationsLoading || isValidateLoading}
			isComponentLoading={isComponentLoading}
			setPageLoading={setPageLoading}
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
