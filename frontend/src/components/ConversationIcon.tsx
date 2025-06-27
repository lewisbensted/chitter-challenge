import React, { Fragment, useState } from "react";
import { IConversation } from "../interfaces/interfaces";
import MessageModal from "./MessageModal";
import IconButton from "@mui/material/IconButton/IconButton";
import Chat from "@mui/icons-material/Chat";
import MarkUnreadChatAlt from "@mui/icons-material/MarkUnreadChatAlt";

interface Props {
	userId?: string | null;
	conversation: IConversation;
	isComponentLoading: boolean;
	setComponentLoading: React.Dispatch<React.SetStateAction<boolean>>;
	setConversations: React.Dispatch<React.SetStateAction<IConversation[]>>;
	reloadTrigger: boolean;
	toggleReloadTrigger: React.Dispatch<React.SetStateAction<boolean>>;
	updateUnreadRef: React.MutableRefObject<boolean>;
}

const ConversationIcon: React.FC<Props> = ({
	userId,
	conversation,
	isComponentLoading,
	setComponentLoading,
	setConversations,
	toggleReloadTrigger,
	updateUnreadRef,
}) => {
	const [selectedConversation, setSelectedConversation] = useState<IConversation | null>();


	return (
		<Fragment>
			{selectedConversation && (
				<MessageModal
					userId={userId}
					conversation={selectedConversation}
					isOpen={!!selectedConversation}
					isComponentLoading={isComponentLoading}
					setComponentLoading={setComponentLoading}
					closeModal={() => {
						setSelectedConversation(null);
					}}
					setConversations={setConversations}
					toggleReloadTrigger={toggleReloadTrigger}
					updateUnreadRef={updateUnreadRef}
					userPageId={conversation.interlocutorId}
				/>
			)}
			<IconButton
				onClick={() => {
					setSelectedConversation(conversation);
				}}
				disabled={isComponentLoading}
				color="primary"
			>
				{conversation.unread ? <MarkUnreadChatAlt /> : <Chat />}
			</IconButton>
		</Fragment>
	);
};

export default ConversationIcon;
