import React, { useEffect, useRef, useState } from "react";
import { IConversation, IMessage } from "../interfaces/interfaces";
import axios from "axios";
import { serverURL } from "../config/config";
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

interface Props {
	userId?: string | null;
	conversation: IConversation;
	isOpen: boolean;
	isComponentLoading: boolean;
	closeModal: () => void;
	setComponentLoading: (arg: boolean) => void;
	setConversations: (arg: IConversation[]) => void;
	reloadTrigger: boolean;
	toggleReloadTrigger: (arg: boolean) => void;
	setReloadWhenClosed?: (arg: boolean) => void;
	unread: number;
	onUserPage: boolean;
}

const MessageModal: React.FC<Props> = ({
	userId,
	conversation,
	isOpen,
	isComponentLoading,
	closeModal,
	setComponentLoading,
	reloadTrigger,
	toggleReloadTrigger,
	setReloadWhenClosed,
	unread,
	onUserPage,
}) => {
	const [errors, setErrors] = useState<string[]>([]);
	const [messages, setMessages] = useState<IMessage[]>();
	const [messagesError, setMessagesError] = useState<string>();
	const [isMessagesLoading, setMessagesLoading] = useState<boolean>(true);
	const [scroll, setScroll] = useState<boolean>(false);

	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (isOpen) {
			setComponentLoading(true);
			axios
				.get(`${serverURL}/messages/${conversation.interlocutorId}`, {
					withCredentials: true,
				})
				.then((res: { data: IMessage[] }) => {
					setMessages(res.data);
					setScroll(true);
					setMessagesLoading(false);
					setComponentLoading(false);
					if (unread > 0) {
						toggleReloadTrigger(!reloadTrigger);
					}
				})
				.catch(() => {
					setMessagesError("An unexpected error occured while loading messages.");
					setMessagesLoading(false);
					setComponentLoading(false);
				});
		}
	}, [isOpen, conversation.interlocutorId, setComponentLoading, toggleReloadTrigger]);

	useEffect(() => {
		if (isOpen && scroll) {
			ref.current?.lastElementChild?.scrollIntoView();
			setScroll(false);
		}
	}, [isOpen, messages, scroll]);

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
						<IconButton onClick={closeModal} disabled={isComponentLoading} color="primary">
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
						{isMessagesLoading ? (
							<FlexBox>
								<CircularProgress thickness={5} />
							</FlexBox>
						) : messagesError ? (
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
								{messages?.map((message) => (
									<Message
										key={message.uuid}
										userId={userId}
										message={message}
										setMessages={setMessages}
										isComponentLoading={isComponentLoading}
										setComponentLoading={setComponentLoading}
										setErrors={setErrors}
										setReloadWhenClosed={setReloadWhenClosed}
									/>
								))}
							</Grid2>
						)}
						<SendMessage
							recipientId={conversation.interlocutorId}
							isDisabled={isComponentLoading}
							setMessages={setMessages}
							setErrors={setErrors}
							setComponentLoading={setComponentLoading}
							setReloadWhenClosed={setReloadWhenClosed}
							setScroll={setScroll}
						/>
					</Grid2>
				</Grid2>
			</Dialog>
		</ThemeProvider>
	);
};

export default MessageModal;
