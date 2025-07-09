import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { IConversation } from "../interfaces/interfaces";
import Message from "./Message";
import ErrorModal from "./ErrorModal";
import SendMessage from "./SendMessage";
import IconButton from "@mui/material/IconButton/IconButton";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Close from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import { Grid2, Link, ThemeProvider, Typography } from "@mui/material";
import theme from "../styles/theme";
import FlexBox from "../styles/FlexBox";
import useFetchMessages from "../hooks/useFetchMessages";
import { Link as RouterLink } from "react-router-dom";

interface Props {
	userId?: string | null;
	conversation: IConversation;
	isOpen: boolean;
	isDisabled: boolean;
	closeModal: () => void;
	setComponentLoading: React.Dispatch<React.SetStateAction<boolean>>;
	setConversations: React.Dispatch<React.SetStateAction<IConversation[]>>;
	toggleUnreadTrigger: React.Dispatch<React.SetStateAction<boolean>>;
	toggleConversationsTrigger: React.Dispatch<React.SetStateAction<boolean>>;
	userPageId?: string;
}

const MessageModal: React.FC<Props> = ({
	userId,
	conversation,
	isOpen,
	isDisabled,
	closeModal,
	setComponentLoading,
	toggleUnreadTrigger,
	toggleConversationsTrigger,
	userPageId,
}) => {
	const [errors, setErrors] = useState<string[]>([]);
	const [page, setPage] = useState<number>(0);

	const {
		messages,
		messagesError,
		isMessagesLoading,
		hasNextPage,
		setMessagesLoading,
		setMessages,
		setMessagesError,
		fetchMessages,
		markMessagesRead,
		refreshMessages,
	} = useFetchMessages();

	useEffect(() => {
		if (!isOpen) return;
		const loadAndMarkRead = async () => {
			await fetchMessages(conversation.interlocutorId, setErrors, page === 0 ? 20 : 10);
			if (page === 0) {
				toggleScrollTrigger((prev) => !prev);
			}
			if (conversation.unread) {
				await markMessagesRead(conversation.interlocutorId);
				toggleUnreadTrigger((prev) => !prev);
				toggleConversationsTrigger((prev) => !prev);
			}
			setMessagesSet(true);
		};
		void loadAndMarkRead();
	}, [
		isOpen,
		conversation.interlocutorId,
		conversation.unread,
		page,
		fetchMessages,
		markMessagesRead,
		toggleConversationsTrigger,
		toggleUnreadTrigger
	]);

	const [refreshMessagesTrigger, toggleRefreshMessages] = useState<boolean>(false);

	const hasRefreshedMessages = useRef(false);
	const prevUnreadRef = useRef<boolean>();

	useEffect(() => {
		const prevUnread = prevUnreadRef.current;
		prevUnreadRef.current = conversation.unread;

		if (!isOpen || hasRefreshedMessages.current || prevUnread === undefined) return;

		const load = () => {
			refreshMessages(conversation.interlocutorId);
			hasRefreshedMessages.current = true;
		};

		if (prevUnread) {
			load();
		}
	}, [refreshMessagesTrigger, conversation.interlocutorId, isOpen, refreshMessages, conversation.unread]);

	const [scrollTrigger, toggleScrollTrigger] = useState<boolean>(false);

	const listRef = useRef<HTMLDivElement>(null);
	const hasReachedBottom = useRef<boolean>(false);

	const [isMessagesSet, setMessagesSet] = useState<boolean>(false);
	useLayoutEffect(() => {
		requestAnimationFrame(() => {
			if (!listRef.current || !isMessagesSet) return;
			listRef.current.scrollTo({
				top: listRef.current.scrollHeight,
				behavior: hasReachedBottom.current ? "smooth" : "auto",
			});
			if (!hasReachedBottom.current) {
				hasReachedBottom.current = true;
			}
		});
	}, [scrollTrigger, isMessagesSet]);

	const observer = useRef<IntersectionObserver>();
	const lastMessageRef = useCallback(
		(message: HTMLElement | null) => {
			if (observer.current) observer.current.disconnect();
			observer.current = new IntersectionObserver((messages) => {
				if (isMessagesLoading || !isMessagesSet) return;
				if (messages[0].isIntersecting && hasNextPage) {
					setPage((page) => page + 1);
				}
			});
			if (message) observer.current.observe(message);
		},
		[isMessagesLoading, hasNextPage, isMessagesSet]
	);


	return (
		<ThemeProvider theme={theme}>
			<Dialog
				open={isOpen}
				fullWidth
				maxWidth="md"
				onClick={() => {
					toggleRefreshMessages((prev) => !prev);
				}}
			>
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
								<Link to={`/users/${conversation.interlocutorId}`} component={RouterLink}>
									{conversation.interlocutorUsername}
								</Link>
							)}
						</Typography>
						{messagesError ? (
							<Typography variant="subtitle1">{messagesError}</Typography>
						) : (
							<Grid2
								sx={{
									overflowY: "auto",
									maxHeight: 390,
									scrollbarGutter: "stable",
								}}
								ref={listRef}
							>
								{isMessagesLoading && (
									<FlexBox>
										<CircularProgress thickness={5} />
									</FlexBox>
								)}
								{messages.map((message, index) => (
									<Message
										ref={index === 0 ? lastMessageRef : null}
										key={message.uuid}
										userId={userId}
										message={message}
										messages={messages}
										setMessages={setMessages}
										isDisabled={isDisabled || isMessagesLoading}
										setComponentLoading={setComponentLoading}
										setErrors={setErrors}
										toggleReloadTrigger={toggleConversationsTrigger}
										userPageId={userPageId}
									/>
								))}
							</Grid2>
						)}
						{!messagesError && (
							<SendMessage
								recipientId={conversation.interlocutorId}
								isDisabled={isDisabled || isMessagesLoading}
								toggleReloadTrigger={toggleConversationsTrigger}
								setMessages={setMessages}
								setErrors={setErrors}
								setComponentLoading={setComponentLoading}
								triggerScroll={toggleScrollTrigger}
								setMessagesError={setMessagesError}
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
