import React from "react";
import { Link, Typography } from "@mui/material";
import type { IConversation, IUserEnhanced } from "../interfaces/interfaces";
import ConversationIcon from "./ConversationIcon";
import FollowIcon from "./FollowIcon";
import { Fragment } from "react/jsx-runtime";
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
	return (
		<Typography variant="h4">
			{userPage ? (
				user.username
			) : (
				<Link to={`/users/${user.uuid}`} component={RouterLink}>
					{user.username}
				</Link>
			)}
			{sessionUserId && sessionUserId !== user.uuid && (
				<Fragment>
					<ConversationIcon
						conversation={conversation}
						setSelectedConversation={setSelectedConversation}
						user={user}
					/>

					{isFollowing !== null && <FollowIcon onSuccess={onToggleFollow} userEnhanced={userEnhanced} />}
				</Fragment>
			)}
		</Typography>
	);
};
User.displayName = "User";

export default User;
