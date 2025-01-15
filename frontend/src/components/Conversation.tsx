import React, { useState } from "react";
import { IConversation } from "../utils/interfaces";
import { Card, CardActionArea, CardContent, Grid2, Link, Typography } from "@mui/material";
import Done from "@mui/icons-material/Done";
import { ThemeProvider } from "@emotion/react";
import theme from "../styles/theme";
import { MarkUnreadChatAlt } from "@mui/icons-material";
import MessageModal from "./MessageModal";

interface Props {
	userId?: string;
	conversation: IConversation;
	isComponentLoading: boolean;
	setComponentLoading: (arg: boolean) => void;
	setConversations: (arg: IConversation[]) => void;
	reloadTrigger: boolean;
	toggleReloadTrigger: (arg: boolean) => void;
}

const Conversation: React.FC<Props> = ({
	userId,
	conversation,
	isComponentLoading,
	setComponentLoading,
	setConversations,
	reloadTrigger,
	toggleReloadTrigger,
}) => {
	const [messageModalOpen, setMessageModalOpen] = useState<boolean>(false);
	const [reloadWhenClosed, setReloadWhenClosed] = useState<boolean>(false);

	return (
		<ThemeProvider theme={theme}>
			<MessageModal
				userId={userId}
				conversation={conversation}
				isOpen={messageModalOpen}
				isComponentLoading={isComponentLoading}
				setComponentLoading={setComponentLoading}
				closeModal={() => {
					setMessageModalOpen(false);
					if (reloadWhenClosed) {
						toggleReloadTrigger(!reloadTrigger);
						setReloadWhenClosed(false);
					}
				}}
				setConversations={setConversations}
				reloadTrigger={reloadTrigger}
				toggleReloadTrigger={toggleReloadTrigger}
				setReloadWhenClosed={setReloadWhenClosed}
				unread={conversation.unread}
			/>

			<Card>
				<CardActionArea
					disabled={isComponentLoading}
					onClick={isComponentLoading ? () => {} : () => { setMessageModalOpen(true); }}
				>
					<CardContent>
						<Grid2 container>
							<Grid2>
								<Link
									onClick={(event) => { event.stopPropagation(); }}
									href={`/users/${conversation.interlocutorId}`}
									variant="h6"
								>
									{conversation.interlocutorUsername}
								</Link>
							</Grid2>
							<Grid2 size={11}>
								<Typography
									fontWeight={
										!conversation.latestMessage!.isRead &&
										conversation.latestMessage?.senderId !== userId
											? "bold"
											: ""
									}
									variant="body2"
								>
									{conversation.latestMessage!.text}
								</Typography>
							</Grid2>
							<Grid2 size={1}>
								{conversation.latestMessage!.isRead &&
								conversation.latestMessage?.senderId === userId ? (
										<Done fontSize="small" color="primary" />
									) : null}
								{!conversation.latestMessage!.isRead &&
								conversation.latestMessage?.senderId !== userId ? (
										<MarkUnreadChatAlt fontSize="small" color="primary" />
									) : null}
							</Grid2>
						</Grid2>
					</CardContent>
				</CardActionArea>
			</Card>
		</ThemeProvider>
	);
};

export default Conversation;
