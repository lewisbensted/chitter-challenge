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
import { useError } from "../contexts/ErrorContext";
import { useLayout } from "../contexts/LayoutContext";
import ScrollGrid from "../styles/ScrollGrid";

interface Props {
	conversation: IConversation;
	isOpen: boolean;
	isDisabled: boolean;
	setSelectedConversation: React.Dispatch<React.SetStateAction<IConversation | null | undefined>>;
	setConversations: React.Dispatch<React.SetStateAction<IConversation[]>>;
	toggleConversationsTrigger: React.Dispatch<React.SetStateAction<boolean>>;
	userPageId?: string;
}

const MessageModal: React.FC<Props> = ({
	conversation,
	isOpen,
	isDisabled,
	setSelectedConversation,
	toggleConversationsTrigger,
	userPageId,
}) => {
	const { errors, setErrors, clearErrors } = useError();
	const { toggleUnreadTrigger } = useLayout();

	const {
		messages,
		messagesError,
		isMessagesLoading,
		hasNextPage,
		page,
		refreshMessagesTrigger,
		toggleRefreshMessages,
		setMessages,
		setMessagesError,
		fetchMessages,
		markMessagesRead,
		refreshMessages,
		setPage
	} = useFetchMessages(conversation.interlocutorId);

	useEffect(() => {
		if (!isOpen) return;
		const loadAndMarkRead = async () => {
			await fetchMessages(page === 0 ? 20 : 10);
			if (page === 0) {
				toggleScrollTrigger((prev) => !prev);
			}
			if (conversation.unread) {
				await markMessagesRead();
				toggleUnreadTrigger((prev) => !prev);
				toggleConversationsTrigger((prev) => !prev);
			}
			setMessagesSet(true);
		};
		void loadAndMarkRead();
	}, [
		isOpen,
		conversation.unread,
		page,
		fetchMessages,
		markMessagesRead,
		toggleConversationsTrigger,
		toggleUnreadTrigger,
	]);

	const hasRefreshedMessages = useRef(false);
	const prevUnreadRef = useRef<boolean>();

	useEffect(() => {
		const prevUnread = prevUnreadRef.current;
		prevUnreadRef.current = conversation.unread;

		if (!isOpen || hasRefreshedMessages.current || prevUnread === undefined) return;

		if (prevUnread) {
			refreshMessages();
			hasRefreshedMessages.current = true;
		}
	}, [refreshMessagesTrigger, isOpen, refreshMessages, conversation.unread]);

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
		[isMessagesLoading, hasNextPage, isMessagesSet, setPage]
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
				<ErrorModal errors={errors} closeModal={clearErrors} />
				<Grid2 container marginInline={2} marginTop={1}>
					<Grid2 size={11} />
					<Grid2 size={1} display="flex" justifyContent="flex-end">
						<IconButton
							onClick={() => {
								setSelectedConversation(null);
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
							<ScrollGrid ref={listRef} height={350}>
								{isMessagesLoading && (
									<FlexBox>
										<CircularProgress thickness={5} />
									</FlexBox>
								)}
								{messages.map((message, index) => (
									<Message
										ref={index === 0 ? lastMessageRef : null}
										key={message.uuid}
										message={message}
										messages={messages}
										setMessages={setMessages}
										isDisabled={isDisabled || isMessagesLoading}
										setErrors={setErrors}
										toggleReloadTrigger={toggleConversationsTrigger}
										userPageId={userPageId}
									/>
								))}
							</ScrollGrid>
						)}
						{!messagesError && (
							<SendMessage
								recipientId={conversation.interlocutorId}
								isDisabled={isDisabled || isMessagesLoading}
								toggleReloadTrigger={toggleConversationsTrigger}
								setMessages={setMessages}
								setErrors={setErrors}
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
