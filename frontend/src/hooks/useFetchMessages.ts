import { useCallback, useRef, useState } from "react";
import { IMessage } from "../interfaces/interfaces";
import { serverURL } from "../config/config";
import axios from "axios";
import { handleErrors, logErrors } from "../utils/handleErrors";

const useFetchMessages = () => {
	const [messages, setMessages] = useState<IMessage[]>([]);
	const [isMessagesLoading, setMessagesLoading] = useState<boolean>(true);
	const [messagesError, setMessagesError] = useState<string>("");
	const [hasNextPage, setHasNextPage] = useState(false);
	const cursorRef = useRef<string>();
	const hasLoadedOnceRef = useRef<boolean>(false);

	const fetchMessages = useCallback(
		async (interlocutorId: string, setErrors: React.Dispatch<React.SetStateAction<string[]>>, take?: number) => {
			try {
				if (take) {
					setMessagesLoading(true);

					const params = new URLSearchParams();
					if (cursorRef.current) params.append("cursor", cursorRef.current);
					params.append("take", take.toString());

					const res = await axios.get<IMessage[]>(`${serverURL}/messages/${interlocutorId}?${params}`, {
						withCredentials: true,
					});
					const newMessages = res.data;
					if (!hasLoadedOnceRef.current) {
						hasLoadedOnceRef.current = true;
					}

					setHasNextPage(newMessages.length >= take );
					if (newMessages.length) {
						setMessages((message) => {
							
							return [...newMessages, ...message];
						});
						cursorRef.current = newMessages[0].uuid;
					}
				} else {
					setMessages((messages) => {
						const updatedMessages = messages.map((message) =>
							message.sender.uuid === interlocutorId && !message.messageStatus.isRead
								? {
										...message,
										messageStatus: { isRead: true, isDeleted: message.messageStatus.isDeleted },
									}
								: message
						);
						return updatedMessages;
					});
				}

				setMessagesError("");
			} catch (error) {
				if (!hasLoadedOnceRef.current) {
					logErrors(error);
					setMessagesError("An unexpected error occurred while loading messages.");
				} else {
					handleErrors(error, "loading messages", setErrors);
					setHasNextPage(false);
				}
			} finally {
				setMessagesLoading(false);
			}
		},
		[]
	);

	const markMessagesRead = useCallback(async (interlocutorId: string) => {
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
	}, []);

	return {
		messages,
		messagesError,
		isMessagesLoading,
		hasNextPage,
		setMessages,
		setMessagesError,
		setMessagesLoading,
		fetchMessages,
		markMessagesRead,
	};
};

export default useFetchMessages;
