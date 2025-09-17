import React, { Fragment, useState } from "react";
import type { IConversation } from "../interfaces/interfaces";
import MessageModal from "./MessageModal";
import IconButton from "@mui/material/IconButton/IconButton";
import Chat from "@mui/icons-material/Chat";
import MarkUnreadChatAlt from "@mui/icons-material/MarkUnreadChatAlt";

interface Props {
	conversation: IConversation;
	toggleConversationsTrigger: React.Dispatch<React.SetStateAction<boolean>>;
	selectedConversation: IConversation | null;
	setSelectedConversation: React.Dispatch<React.SetStateAction<IConversation | null>>;
}

const ConversationIcon: React.FC<Props> = ({
	conversation,
	toggleConversationsTrigger,
	selectedConversation,
	setSelectedConversation,
}) => (
	<Fragment>
		{selectedConversation && (
			<MessageModal
				conversation={selectedConversation}
				isOpen={!!selectedConversation}
				setSelectedConversation={setSelectedConversation}
				toggleConversationsTrigger={toggleConversationsTrigger}
				userPageId={selectedConversation.interlocutorId}
			/>
		)}
		<IconButton
			onClick={() => {
				setSelectedConversation(conversation);
			}}
		>
			{conversation.unread ? <MarkUnreadChatAlt /> : <Chat />}
		</IconButton>
	</Fragment>
);
export default ConversationIcon;
