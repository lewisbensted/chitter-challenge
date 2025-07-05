import { useCallback, useState } from "react";
import { IMessage } from "../interfaces/interfaces";
import { serverURL } from "../config/config";
import axios from "axios";
import { handleErrors, logErrors } from "../utils/handleErrors";

const useFetchMessages = () => {
	const [messages, setMessages] = useState<IMessage[]>([]);
	const [isMessagesLoading, setMessagesLoading] = useState<boolean>(true);
	const [messagesError, setMessagesError] = useState<string>("");

	const fetchMessages = useCallback(
		async (interlocutorId: string, setErrors?: React.Dispatch<React.SetStateAction<string[]>>) => {
			try {
				const messages = await axios.get<IMessage[]>(`${serverURL}/messages/${interlocutorId}`, {
					withCredentials: true,
				});
				setMessages(messages.data);
			} catch (error) {
				if (setErrors) {
					handleErrors(error, "fetching messages.", setErrors);
				} else {
					logErrors(error);
					setMessagesError("An unexpected error occured while loading messages.");
				}
			} finally {
				setMessagesLoading(false);
			}
		},
		[]
	);

	const markMessagesRead = useCallback(
		async (interlocutorId: string) => {
			try {
				await axios.put(
					`${serverURL}/messages/read/${interlocutorId}`,
					{},
					{
						withCredentials: true,
					}
				);
			} catch (error) {
				logErrors(error);
			}
		},
		[]
	);

	return {
		messages,
		messagesError,
		isMessagesLoading,
		setMessages,
		setMessagesError,
		setMessagesLoading,
		fetchMessages,
		markMessagesRead,
	};
};

export default useFetchMessages;
