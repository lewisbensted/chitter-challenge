import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { IConversation } from "../interfaces/interfaces";
import Message from "./Message";
import ErrorModal from "./ErrorModal";
import SendMessage from "./SendMessage";
import IconButton from "@mui/material/IconButton/IconButton";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Close from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import { Box, Grid2, Link, ThemeProvider, Typography } from "@mui/material";
import theme from "../styles/theme";
import FlexBox from "../styles/FlexBox";
import useFetchMessages from "../hooks/useFetchMessages";

interface Props {
	userId?: string | null;
	conversation: IConversation;
	isOpen: boolean;
	isDisabled: boolean;
	closeModal: () => void;
	setComponentLoading: React.Dispatch<React.SetStateAction<boolean>>;
	setConversations: React.Dispatch<React.SetStateAction<IConversation[]>>;
	toggleReloadTrigger: React.Dispatch<React.SetStateAction<boolean>>;
	updateUnreadRef: React.MutableRefObject<boolean>;
	userPageId?: string;
}

const MessageModal: React.FC<Props> = ({
	userId,
	conversation,
	isOpen,
	isDisabled,
	closeModal,
	setComponentLoading,
	toggleReloadTrigger,
	updateUnreadRef,
	userPageId,
}) => {
	const [errors, setErrors] = useState<string[]>([]);

	const ref = useRef<HTMLDivElement>(null);

	const {
		messages,
		messagesError,
		isMessagesLoading,
		setMessagesLoading,
		setMessages,
		setMessagesError,
		fetchMessages,
		markMessagesRead,
	} = useFetchMessages();

	useEffect(() => {
		if (!isOpen) return;
		const loadAndMarkRead = async () => {
			await fetchMessages(conversation.interlocutorId);
			toggleScrollTrigger((prev) => !prev);

			if (conversation.unread) {
				await markMessagesRead(conversation.interlocutorId);
				updateUnreadRef.current = true;
				toggleReloadTrigger((prev) => !prev);
			}
		};
		void loadAndMarkRead();
	}, [
		isOpen,
		conversation.interlocutorId,
		conversation.unread,
		updateUnreadRef,
		toggleReloadTrigger,
		fetchMessages,
		markMessagesRead,
	]);

	const [refresh, triggerRefresh] = useState<boolean>(false);

	const hasRefreshedMessages = useRef(false);
	const prevUnreadRef = useRef<boolean>();

	useEffect(() => {
		const prevUnread = prevUnreadRef.current;
		prevUnreadRef.current = conversation.unread;

		if (!isOpen || hasRefreshedMessages.current || prevUnread === undefined) return;

		const load = async () => {
			await fetchMessages(conversation.interlocutorId, setErrors);
			hasRefreshedMessages.current = true;
		};

		if (prevUnread) {
			void load();
		}
	}, [refresh, conversation.interlocutorId, isOpen, fetchMessages, conversation.unread]);

	const [scrollTrigger, toggleScrollTrigger] = useState<boolean>(false);

	const bottomRef = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		if (isOpen) {
			requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }));
		}
	}, [isOpen, scrollTrigger]);


	return (
		<ThemeProvider theme={theme}>
			<Dialog open={isOpen} fullWidth maxWidth="md">
				<ErrorModal
					errors={errors}
					closeModal={() => {
						setErrors([]);
					}}
				/>
				<Grid2 container marginInline={2} marginTop={1}>
					<Grid2 size={11} />
					<Grid2 size={1} display="flex" justifyContent="flex-end">
						<IconButton
							onClick={() => {
								setMessagesLoading(false);
								closeModal();
							}}
						>
							<Close />
						</IconButton>
					</Grid2>
					<Grid2 marginInline={3} size={12}>
						<Typography variant="h5">
							{userPageId ? (
								conversation.interlocutorUsername
							) : (
								<Link href={`/users/${conversation.interlocutorId}`}>
									{conversation.interlocutorUsername}
								</Link>
							)}
						</Typography>
						{messagesError ? (
							<Typography variant="subtitle1">{messagesError}</Typography>
						) : (
							<Grid2
								ref={ref}
								sx={{
									overflowY: "auto",
									maxHeight: 390,
									scrollbarGutter: "stable",
								}}
							>
								{messages.map((message) => (
									<Message
										key={message.uuid}
										userId={userId}
										message={message}
										messages={messages}
										setMessages={setMessages}
										isDisabled={isDisabled || isMessagesLoading}
										setComponentLoading={setComponentLoading}
										setErrors={setErrors}
										toggleReloadTrigger={toggleReloadTrigger}
										updateUnreadRef={updateUnreadRef}
										userPageId={userPageId}
									/>
								))}
								{isMessagesLoading && (
									<FlexBox>
										<CircularProgress thickness={5} />
									</FlexBox>
								)}
								<Box ref={bottomRef} />
							</Grid2>
						)}
						{!messagesError && (
							<SendMessage
								recipientId={conversation.interlocutorId}
								isDisabled={isDisabled || isMessagesLoading}
								toggleReloadTrigger={toggleReloadTrigger}
								setMessages={setMessages}
								setErrors={setErrors}
								setComponentLoading={setComponentLoading}
								triggerScroll={toggleScrollTrigger}
								setMessagesError={setMessagesError}
								triggerRefresh={triggerRefresh}
								updateUnreadRef={updateUnreadRef}
								userPageId={userPageId}
							/>
						)}
					</Grid2>
				</Grid2>
			</Dialog>
		</ThemeProvider>
	);
};

export default MessageModal;
