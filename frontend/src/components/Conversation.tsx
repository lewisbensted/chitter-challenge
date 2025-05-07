import React, { useState } from "react";
import { IConversation } from "../interfaces/interfaces";
import { Card, CardActionArea, CardContent, Grid2, Link, Typography } from "@mui/material";
import Done from "@mui/icons-material/Done";
import { ThemeProvider } from "@emotion/react";
import theme from "../styles/theme";
import { PriorityHigh } from "@mui/icons-material";
import MessageModal from "./MessageModal";
import { formatDate } from "../utils/formatDate";

interface Props {
	userId?: string | null;
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

	const createdAt = new Date(conversation.latestMessage!.createdAt);

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
				onUserPage={false}
			/>

			<Card>
				<CardActionArea
					disabled={isComponentLoading}
					onClick={
						isComponentLoading
							? undefined
							: () => {
									setMessageModalOpen(true);
								}
					}
				>
					<CardContent>
						<Grid2 container width={600}>
							<Grid2 size={8}>
								<Typography variant="h6">
									<Link
										onClick={(event) => {
											event.stopPropagation();
										}}
										href={`/users/${conversation.interlocutorId}`}
									>
										{conversation.interlocutorUsername}
									</Link>
								</Typography>
							</Grid2>
							<Grid2 size={4}>
								<Typography variant="body2" justifyContent="flex-end">
									{formatDate(createdAt)}
								</Typography>
							</Grid2>
							<Grid2 size={11}>
								<Typography variant="body2">{conversation.latestMessage?.text}</Typography>
							</Grid2>
							<Grid2 size={1} display="flex" justifyContent="flex-end">
								{conversation.latestMessage?.senderId === userId ? (
									conversation.latestMessage?.isRead ? (
										<Done fontSize="small" color="primary" />
									) : null
								) : conversation.latestMessage?.isRead ? null : (
									<PriorityHigh fontSize="small" color="primary" />
								)}
							</Grid2>
						</Grid2>
					</CardContent>
				</CardActionArea>
			</Card>
		</ThemeProvider>
	);
};

export default Conversation;
