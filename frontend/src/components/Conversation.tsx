import React from "react";
import { IConversation } from "../interfaces/interfaces";
import { Card, CardActionArea, CardContent, Grid2, Link, Typography } from "@mui/material";
import Done from "@mui/icons-material/Done";
import { ThemeProvider } from "@emotion/react";
import theme from "../styles/theme";
import { PriorityHigh } from "@mui/icons-material";
import { formatDate } from "../utils/formatDate";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface Props {
	conversation: IConversation;
	isDisabled: boolean;
	setConversations: React.Dispatch<React.SetStateAction<IConversation[]>>;
	setSelectedConversation: React.Dispatch<React.SetStateAction<IConversation | null | undefined>>;
}

const Conversation: React.FC<Props> = ({ conversation, isDisabled, setSelectedConversation }) => {

	const { userId } = useAuth();

	const createdAt = new Date(conversation.latestMessage!.createdAt);

	return (
		<ThemeProvider theme={theme}>
			<Card>
				<CardActionArea
					disabled={isDisabled}
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
										to={`/users/${conversation.interlocutorId}`}
										component={RouterLink}
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
									fontStyle={conversation.latestMessage?.messageStatus.isDeleted ? "italic" : "none"}
									variant="body2"
								>
									{conversation.latestMessage?.messageStatus.isDeleted
										? conversation.latestMessage.senderId === userId
											? "You deleted this message."
											: `${conversation.interlocutorUsername} deleted this message`
										: conversation.latestMessage?.text}
								</Typography>
							</Grid2>

							<Grid2 size={1} display="flex" justifyContent="flex-end">
				
								{conversation.unread ? (
									<PriorityHigh fontSize="small" color="primary" />
								) : (
									conversation.latestMessage?.senderId === userId &&
									conversation.latestMessage?.messageStatus.isRead &&
									!conversation.latestMessage.messageStatus.isDeleted && (
										<Done fontSize="small" color="primary" />
									)
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
