import { useCallback, useState } from "react";
import { IMessage } from "../interfaces/interfaces";
import { serverURL } from "../config/config";
import axios from "axios";

const useFetchMessages = () => {
	const [messages, setMessages] = useState<IMessage[]>([]);
	const [isMessagesLoading, setMessagesLoading] = useState<boolean>(true);
	const [messagesError, setMessagesError] = useState<string>("");

	const fetchMessages = useCallback(async (interlocutorId: string) => {
		try {
			const messages = await axios.get<IMessage[]>(`${serverURL}/messages/${interlocutorId}`, {
				withCredentials: true,
			});
			setMessages(messages.data);
		} catch {
			setMessagesError("An unexpected error occured while loading messages.");
		} finally {
			setMessagesLoading(false);
		}
	}, []);

	return {
		messages,
		messagesError,
		isMessagesLoading,
		setMessages,
		setMessagesError,
		setMessagesLoading,
		fetchMessages,
	};
};

export default useFetchMessages;
