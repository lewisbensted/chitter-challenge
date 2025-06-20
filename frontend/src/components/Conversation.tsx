import React from "react";
import { IConversation } from "../interfaces/interfaces";
import { Card, CardActionArea, CardContent, Grid2, Link, Typography } from "@mui/material";
import Done from "@mui/icons-material/Done";
import { ThemeProvider } from "@emotion/react";
import theme from "../styles/theme";
import { PriorityHigh } from "@mui/icons-material";
import { formatDate } from "../utils/formatDate";

interface Props {
	userId?: string | null;
	conversation: IConversation;
	isComponentLoading: boolean;
	setComponentLoading: React.Dispatch<React.SetStateAction<boolean>>;
	setConversations: React.Dispatch<React.SetStateAction<IConversation[]>>;
	reloadTrigger: boolean;
	toggleReloadTrigger: React.Dispatch<React.SetStateAction<boolean>>;
	setSelectedConversation: React.Dispatch<React.SetStateAction<IConversation | null | undefined>>;
}

const Conversation: React.FC<Props> = ({ userId, conversation, isComponentLoading, setSelectedConversation }) => {
	const createdAt = new Date(conversation.latestMessage!.createdAt);

	return (
		<ThemeProvider theme={theme}>
			<Card>
				<CardActionArea
					disabled={isComponentLoading}
					onClick={() => {
						setSelectedConversation(conversation);
					}}
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
								<Typography
									fontStyle={conversation.latestMessage?.isDeleted ? "italic" : "none"}
									variant="body2"
								>
									{conversation.latestMessage?.isDeleted
										? conversation.latestMessage.senderId === userId
											? "You deleted this message."
											: `${conversation.interlocutorUsername} deleted this message`
										: conversation.latestMessage?.text}
								</Typography>
							</Grid2>
							<Grid2 size={1} display="flex" justifyContent="flex-end">
								{conversation.latestMessage?.isDeleted ? null : conversation.latestMessage?.senderId ===
								  userId ? (
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
