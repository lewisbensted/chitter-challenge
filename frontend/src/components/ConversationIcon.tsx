import React, { Fragment, useState } from "react";
import { IConversation } from "../interfaces/interfaces";
import MessageModal from "./MessageModal";
import IconButton from "@mui/material/IconButton/IconButton";
import Chat from "@mui/icons-material/Chat";
import MarkUnreadChatAlt from "@mui/icons-material/MarkUnreadChatAlt";

interface Props {
	userId?: string | null;
	conversation: IConversation;
	isDisabled: boolean;
	setComponentLoading: React.Dispatch<React.SetStateAction<boolean>>;
	setConversations: React.Dispatch<React.SetStateAction<IConversation[]>>;
	toggleConversationsTrigger: React.Dispatch<React.SetStateAction<boolean>>;
	toggleUnreadTrigger: React.Dispatch<React.SetStateAction<boolean>>;
}

const ConversationIcon: React.FC<Props> = ({
	userId,
	conversation,
	isDisabled,
	setComponentLoading,
	setConversations,
	toggleConversationsTrigger,
	toggleUnreadTrigger,
}) => {
	const [selectedConversation, setSelectedConversation] = useState<IConversation | null>();

	return (
		<Fragment>
			{selectedConversation && (
				<MessageModal
					userId={userId}
					conversation={selectedConversation}
					isOpen={!!selectedConversation}
					isDisabled={isDisabled}
					setComponentLoading={setComponentLoading}
					setSelectedConversation={setSelectedConversation}
					setConversations={setConversations}
					toggleConversationsTrigger={toggleConversationsTrigger}
					toggleUnreadTrigger={toggleUnreadTrigger}
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
