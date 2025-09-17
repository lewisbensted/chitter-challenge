import React from "react";
import { Typography } from "@mui/material";
import type { IConversation, IUser } from "../interfaces/interfaces";
import ConversationIcon from "./ConversationIcon";
import FollowIcon from "./FollowIcon";
import { Fragment } from "react/jsx-runtime";

interface Props {
	user: IUser;
	sessionUserId?: string | null;
	conversation?: IConversation | null;
	isFollowing?: boolean | null;
	setFollowing: (isFollowingInput: boolean) => void;
	toggleConversationsTrigger: React.Dispatch<React.SetStateAction<boolean>>;
	selectedConversation: IConversation | null;
	setSelectedConversation: React.Dispatch<React.SetStateAction<IConversation | null>>;
}

const User: React.FC<Props> = ({
	sessionUserId,
	user,
	conversation,
	isFollowing,
	setFollowing,
	toggleConversationsTrigger,
	selectedConversation,
	setSelectedConversation,
}) => (
	<Typography variant="h4">
		{user.username}
		{sessionUserId && sessionUserId !== user.uuid && (
			<Fragment>
				{conversation && (
					<ConversationIcon
						conversation={conversation}
						toggleConversationsTrigger={toggleConversationsTrigger}
						selectedConversation={selectedConversation}
						setSelectedConversation={setSelectedConversation}
					/>
				)}
				{isFollowing !== undefined && (
					<FollowIcon user={user} isFollowing={isFollowing} setFollowing={setFollowing} />
				)}
			</Fragment>
		)}
	</Typography>
);

User.displayName = "User";

export default User;
