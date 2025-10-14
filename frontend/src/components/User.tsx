import React from "react";
import { Box, Card, CardActions, CardContent, Grid2, Link, Typography } from "@mui/material";
import type { IConversation, IUserEnhanced } from "../interfaces/interfaces";
import ConversationIcon from "./ConversationIcon";
import FollowIcon from "./FollowIcon";
import { Link as RouterLink } from "react-router-dom";

interface Props {
	userEnhanced: IUserEnhanced;
	sessionUserId?: string | null;
	setSelectedConversation: React.Dispatch<React.SetStateAction<IConversation | null>>;
	onToggleFollow: (arg: IUserEnhanced) => void;
	userPage?: boolean;
}

const User: React.FC<Props> = ({
	sessionUserId,
	setSelectedConversation,
	onToggleFollow,
	userEnhanced,
	userPage = true,
}) => {
	const { user, conversation, isFollowing } = userEnhanced;
	
	return userPage ? (
		<Grid2 container justifyContent={"center"} alignItems={"center"} gap={0.5}>
			<Typography variant="h4" component="span">{user.username}</Typography>

			{sessionUserId && sessionUserId !== user.uuid && (
				<Box paddingTop={1.3} display={"flex"}>
					<ConversationIcon
						conversation={conversation}
						setSelectedConversation={setSelectedConversation}
						user={user}
					/>

					{isFollowing !== null && <FollowIcon onSuccess={onToggleFollow} userEnhanced={userEnhanced} />}
				</Box>
			)}
		</Grid2>
	) : (
		<Card>
			<Grid2 container width={750}>
				<Grid2 size={10}>
					<CardContent>
						<Grid2 container>
							<Typography variant="h5">
								<Link to={`/users/${user.uuid}`} component={RouterLink}>
									{user.username}
								</Link>
							</Typography>
						</Grid2>
					</CardContent>
				</Grid2>
				<Grid2 size={2} container>
					{sessionUserId && sessionUserId !== user.uuid && (
						<CardActions>
							<ConversationIcon
								conversation={conversation}
								setSelectedConversation={setSelectedConversation}
								user={user}
							/>

							{isFollowing !== null && (
								<FollowIcon onSuccess={onToggleFollow} userEnhanced={userEnhanced} />
							)}
						</CardActions>
					)}
				</Grid2>
			</Grid2>
		</Card>
	);
};
User.displayName = "User";

export default User;
