import React, { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { IConversation, IMessage } from "../interfaces/interfaces";
import Message from "./Message";
import SendMessage from "./SendMessage";
import IconButton from "@mui/material/IconButton/IconButton";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Close from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import { Button, Grid2, Link, Typography } from "@mui/material";
import FlexBox from "../styles/FlexBox";
import useFetchMessages from "../hooks/useFetchMessages";
import { Link as RouterLink } from "react-router-dom";
import { useLayout } from "../contexts/LayoutContext";
import ScrollGrid from "../styles/ScrollGrid";
import { useIsMounted } from "../utils/isMounted";

interface Props {
	conversation: IConversation;
	isOpen: boolean;
	setSelectedConversation: React.Dispatch<React.SetStateAction<IConversation | null>>;
	userPageId?: string;
	convosPage?: boolean;
	setConversations: React.Dispatch<React.SetStateAction<Map<string, IConversation>>>;
	refreshConversations: (
		interlocutorId: string,
		additionalParams?: {
			sort?: boolean | undefined;
			unread?: boolean | undefined;
			latestMessage?: IMessage | undefined;
		}
	) => void;
}

const MessageModal: React.FC<Props> = ({
	conversation,
	isOpen,
	setSelectedConversation,
	userPageId,
	convosPage,
	setConversations,
	refreshConversations,
}) => {
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
		setPage,
		
	} = useFetchMessages(conversation.interlocutorId);

	useEffect(() => {
		if (!isOpen) return;
		const { unread, interlocutorId } = conversation;
		const loadAndMarkRead = async () => {
			await fetchMessages();
			if (page === 0) {
				toggleScrollTrigger((prev) => !prev);
			}
			if (unread) {
				await markMessagesRead();
				toggleUnreadTrigger((prev) => !prev);
				refreshConversations(interlocutorId, { unread: false });
			}
			setMessagesSet(true);
		};
		void loadAndMarkRead();
	}, [
		isOpen,
		conversation,
		page,
		setConversations,
		fetchMessages,
		markMessagesRead,
		toggleUnreadTrigger,
		refreshConversations,
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

	const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
	useEffect(() => {
		if (!isMessagesLoading) setHasFetchedOnce(true);
	}, [isMessagesLoading]);

	const [isMessagesSet, setMessagesSet] = useState<boolean>(false);
	useLayoutEffect(() => {
		requestAnimationFrame(() => {
			if (!listRef.current || !isMessagesSet || !hasFetchedOnce) return;
			listRef.current.scrollTo({
				top: listRef.current.scrollHeight,
				behavior: hasReachedBottom.current ? "smooth" : "auto",
			});
			if (!hasReachedBottom.current) {
				hasReachedBottom.current = true;
			}
		});
	}, [scrollTrigger, isMessagesSet, hasFetchedOnce]);

	const observer = useRef<IntersectionObserver>();
	const lastMessageRef = useCallback(
		(message: HTMLElement | null) => {
			if (observer.current) observer.current.disconnect();
			observer.current = new IntersectionObserver((messages) => {
				if (isMessagesLoading || !isMessagesSet || messagesError) return;
				if (messages[0].isIntersecting && hasNextPage) {
					setPage((page) => page + 1);
				}
			});
			if (message) observer.current.observe(message);
		},
		[isMessagesLoading, hasNextPage, isMessagesSet, messagesError, setPage]
	);

	const isMounted = useIsMounted();

	const message = () => {
		if (messagesError) {
			return page === 0 ? "An unexpected error occured while loading messages." : "Failed to load more messages.";
		} else if (!messages.length) {
			return "No messages to display.";
		}
	};

	return (
		<Dialog
			open={isOpen}
			fullWidth
			maxWidth="md"
			onClick={() => {
				toggleRefreshMessages((prev) => !prev);
			}}
		>
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

					<ScrollGrid ref={listRef} height={350}>
						{isMessagesLoading && (
							<FlexBox>
								<CircularProgress thickness={5} />
							</FlexBox>
						)}
						{!isMessagesLoading && (
							<Fragment>
								<Typography variant="subtitle1">{message()}</Typography>
								{messagesError && (
									<FlexBox>
										<Button onClick={() => fetchMessages(true)} variant="contained">
											<Typography variant="button">Retry</Typography>
										</Button>
									</FlexBox>
								)}
							</Fragment>
						)}
						{hasFetchedOnce && (
							<Fragment>
								{((page === 0 && !isMessagesLoading) || page > 0) &&
									messages.length > 0 &&
									messages.map((message, index) => (
										<Message
											ref={index === 0 ? lastMessageRef : null}
											key={message.uuid}
											message={message}
											messages={messages}
											setMessages={setMessages}
											convosPage={convosPage}
											isModalMounted={isMounted}
											interlocutorId={conversation.interlocutorId}
											refreshConversations={refreshConversations}
										/>
									))}
							</Fragment>
						)}
					</ScrollGrid>

					{!messagesError && (
						<SendMessage
							recipientId={conversation.interlocutorId}
							setMessages={setMessages}
							triggerScroll={toggleScrollTrigger}
							setMessagesError={setMessagesError}
							convosPage={convosPage}
							isModalMounted={isMounted}
							refreshConversations={refreshConversations}
						/>
					)}
				</Grid2>
			</Grid2>
		</Dialog>
	);
};

export default MessageModal;
