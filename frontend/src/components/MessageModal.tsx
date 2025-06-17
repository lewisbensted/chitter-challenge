import React, { useEffect, useRef, useState } from "react";
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
	isComponentLoading: boolean;
	closeModal: () => void;
	setComponentLoading: React.Dispatch<React.SetStateAction<boolean>>;
	setConversations: React.Dispatch<React.SetStateAction<IConversation[]>>;
	reloadTrigger: boolean;
	toggleReloadTrigger: React.Dispatch<React.SetStateAction<boolean>>;
	unread: number;
	onUserPage: boolean;
	conversationErrorOnClose: React.MutableRefObject<boolean>;
}

const MessageModal: React.FC<Props> = ({
	userId,
	conversation,
	isOpen,
	isComponentLoading,
	reloadTrigger,
	closeModal,
	setComponentLoading,
	toggleReloadTrigger,
	unread,
	onUserPage,
	conversationErrorOnClose,
}) => {
	const [errors, setErrors] = useState<string[]>([]);

	const ref = useRef<HTMLDivElement>(null);

	const { messages, messagesError, isMessagesLoading, setMessages, setMessagesError, fetchMessages } =
		useFetchMessages();

	const unreadRef = useRef(unread);
	useEffect(() => {
		unreadRef.current = unread;
	}, [unread]);

	useEffect(() => {
		if (isOpen) {
			void fetchMessages(conversation.interlocutorId).then(() => {
				toggleScrollTrigger((prev) => !prev);
				if (unreadRef.current > 0) {
					conversationErrorOnClose.current = true;
					toggleReloadTrigger((reloadTrigger) => !reloadTrigger);
				}
			});
		}
	}, [isOpen, conversation.interlocutorId, conversationErrorOnClose, toggleReloadTrigger, fetchMessages]);

	const [scrollTrigger, toggleScrollTrigger] = useState<boolean>(false);

	const bottomRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (isOpen) {
			bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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
								closeModal();
							}}
							disabled={isComponentLoading}
							color="primary"
						>
							<Close />
						</IconButton>
					</Grid2>
					<Grid2 marginInline={3} size={12}>
						<Typography variant="h5">
							{onUserPage ? (
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
										isComponentLoading={isComponentLoading}
										setComponentLoading={setComponentLoading}
										setErrors={setErrors}
										toggleReloadTrigger={toggleReloadTrigger}
									/>
								))}
								{isMessagesLoading ? (
									<FlexBox>
										<CircularProgress thickness={5} />
									</FlexBox>
								) : null}
								<Box ref={bottomRef} />
							</Grid2>
						)}
						{messagesError ? null : (
							<SendMessage
								recipientId={conversation.interlocutorId}
								isDisabled={isComponentLoading || isMessagesLoading}
								reloadTrigger={reloadTrigger}
								toggleReloadTrigger={toggleReloadTrigger}
								setMessages={setMessages}
								setErrors={setErrors}
								setComponentLoading={setComponentLoading}
								triggerScroll={toggleScrollTrigger}
								setMessagesError={setMessagesError}
							/>
						)}
					</Grid2>
				</Grid2>
			</Dialog>
		</ThemeProvider>
	);
};

export default MessageModal;
