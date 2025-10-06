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
	conversation: IConversation | null;
	setSelectedConversation: React.Dispatch<React.SetStateAction<IConversation | null>>;
	onToggleFollow: (arg: IUserEnhanced) => void;
	userPage?: boolean;
}

const User: React.FC<Props> = ({
	sessionUserId,
	conversation,
	setSelectedConversation,
	onToggleFollow,
	userEnhanced,
	userPage = true,
}) => (
	<Typography variant="h4">
		{userPage ? (
			userEnhanced.user.username
		) : (
			<Link to={`/users/${userEnhanced.user.uuid}`} component={RouterLink}>
				{userEnhanced.user.username}
			</Link>
		)}
		{sessionUserId && sessionUserId !== userEnhanced.user.uuid && (
			<Fragment>
				<ConversationIcon
					conversation={conversation}
					setSelectedConversation={setSelectedConversation}
					user={userEnhanced.user}
				/>

				{userEnhanced.isFollowing !== null && (
					<FollowIcon onSuccess={onToggleFollow} userEnhanced={userEnhanced} />
				)}
			</Fragment>
		)}
	</Typography>
);

User.displayName = "User";

export default User;
