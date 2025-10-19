import React from "react";
import type { IConversation, IUser } from "../interfaces/interfaces";
import IconButton from "@mui/material/IconButton/IconButton";
import Chat from "@mui/icons-material/Chat";
import MarkUnreadChatAlt from "@mui/icons-material/MarkUnreadChatAlt";

interface Props {
	conversation: IConversation | null;
	user: IUser
	setSelectedConversation: React.Dispatch<React.SetStateAction<IConversation | null>>;
}

const ConversationIcon: React.FC<Props> = ({ conversation, user,setSelectedConversation }) => (
	
	<IconButton
		onClick={() => {
			if (conversation) setSelectedConversation(conversation);
			else
				setSelectedConversation({
					key:"placeholder",
					interlocutorId: user.uuid,
					interlocutorUsername: user.username,
					unread: false,
					latestMessage: null,
				});
		}}
	>
		{conversation?.unread ? <MarkUnreadChatAlt /> : <Chat />}
	</IconButton>
);
export default ConversationIcon;
