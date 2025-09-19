import React from "react";
import type { IConversation } from "../interfaces/interfaces";
import IconButton from "@mui/material/IconButton/IconButton";
import Chat from "@mui/icons-material/Chat";
import MarkUnreadChatAlt from "@mui/icons-material/MarkUnreadChatAlt";

interface Props {
	conversation: IConversation;
	setSelectedConversation: React.Dispatch<React.SetStateAction<IConversation | null>>;
}

const ConversationIcon: React.FC<Props> = ({ conversation, setSelectedConversation }) => (
	<IconButton
		onClick={() => {
			setSelectedConversation(conversation);
		}}
	>
		{conversation.unread ? <MarkUnreadChatAlt /> : <Chat />}
	</IconButton>
);
export default ConversationIcon;
