import React, { forwardRef } from "react";
import type { IConversation } from "../interfaces/interfaces";
import { Card, CardActionArea, CardContent, Grid2, Link, Typography } from "@mui/material";
import Done from "@mui/icons-material/Done";
import { PriorityHigh } from "@mui/icons-material";
import { formatDate } from "../utils/formatDate";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface Props {
	conversation: IConversation;
	setSelectedConversation: React.Dispatch<React.SetStateAction<IConversation | null>>;
}

const Conversation = forwardRef<HTMLDivElement, Props>(({ conversation, setSelectedConversation }, ref) => {
	const { userId } = useAuth();

	const createdAt = new Date(conversation.latestMessage!.createdAt);

	return (
		<Card ref={ref}>
			<CardActionArea
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
									? conversation.latestMessage.sender.uuid === userId
										? "You deleted this message."
										: `${conversation.interlocutorUsername} deleted this message`
									: conversation.latestMessage?.text}
							</Typography>
						</Grid2>

						<Grid2 size={1} display="flex" justifyContent="flex-end">
							{conversation.unread ? (
								<PriorityHigh fontSize="small" color="primary" />
							) : (
								conversation.latestMessage?.sender.uuid === userId &&
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
	);
});

Conversation.displayName = "Conversation";

export default Conversation;
