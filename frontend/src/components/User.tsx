import React from "react";
import { Typography } from "@mui/material";
import type { IConversation, UserEnhanced } from "../interfaces/interfaces";
import ConversationIcon from "./ConversationIcon";
import FollowIcon from "./FollowIcon";
import { Fragment } from "react/jsx-runtime";

interface Props {
	userEnhanced: UserEnhanced;
	sessionUserId?: string | null;
	conversation?: IConversation | null;
	setSelectedConversation: React.Dispatch<React.SetStateAction<IConversation | null>>;
	onToggleFollow: (arg: UserEnhanced) => void;
}

const User: React.FC<Props> = ({
	sessionUserId,
	conversation,
	setSelectedConversation,
	onToggleFollow,
	userEnhanced,
}) => (
	<Typography variant="h4">
		{userEnhanced.user.username}
		{sessionUserId && sessionUserId !== userEnhanced.user.uuid && (
			<Fragment>
				{conversation && (
					<ConversationIcon conversation={conversation} setSelectedConversation={setSelectedConversation} />
				)}
				{userEnhanced.isFollowing !== null && (
					<FollowIcon
						onSuccess={onToggleFollow}
						userEnhanced={userEnhanced}
						isFollowing={userEnhanced.isFollowing}
					/>
				)}
			</Fragment>
		)}
	</Typography>
);

User.displayName = "User";

export default User;
