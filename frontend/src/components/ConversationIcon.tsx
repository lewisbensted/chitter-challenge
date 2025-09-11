import React, { Fragment, useState } from "react";
import type { IConversation } from "../interfaces/interfaces";
import MessageModal from "./MessageModal";
import IconButton from "@mui/material/IconButton/IconButton";
import Chat from "@mui/icons-material/Chat";
import MarkUnreadChatAlt from "@mui/icons-material/MarkUnreadChatAlt";

interface Props {
	conversation: IConversation;
	setConversations: React.Dispatch<React.SetStateAction<IConversation[]>>;
	toggleConversationsTrigger: React.Dispatch<React.SetStateAction<boolean>>;
}

const ConversationIcon: React.FC<Props> = ({
	conversation,
	setConversations,
	toggleConversationsTrigger,
}) => {
	const [selectedConversation, setSelectedConversation] = useState<IConversation | null>();

	return (
		<Fragment>
			{selectedConversation && (
				<MessageModal
					conversation={selectedConversation}
					isOpen={!!selectedConversation}
					setSelectedConversation={setSelectedConversation}
					setConversations={setConversations}
					toggleConversationsTrigger={toggleConversationsTrigger}
					userPageId={conversation.interlocutorId}
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
};

export default ConversationIcon;
