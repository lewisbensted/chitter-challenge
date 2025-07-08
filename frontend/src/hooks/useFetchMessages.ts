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
	const messagesLengthRef = useRef<number>(0);

	const fetchMessages = useCallback(
		async (interlocutorId: string, setErrors: React.Dispatch<React.SetStateAction<string[]>>, take?: number) => {
			try {
				setMessagesLoading(true);

				const cursorParam = take ? (cursorRef.current ? `cursor=${cursorRef.current}` : "") : 0;
				const takeNum = take ?? messagesLengthRef.current;
				const res = await axios.get<IMessage[]>(
					`${serverURL}/messages/${interlocutorId}?${cursorParam}&take=${takeNum}`,
					{
						withCredentials: true,
					}
				);
				const newMessages = res.data;
				if (take) {
					setHasNextPage(newMessages.length < take ? false : true);
					if (newMessages.length) {
						setMessages((message) => {
							const updatedMessages = [...newMessages, ...message];
							messagesLengthRef.current = updatedMessages.length;
							return updatedMessages;
						});
						cursorRef.current = newMessages[0].uuid;
					}
				} else {
					setMessages(newMessages);
				}

				setMessagesError("");
			} catch (error) {
				if (messagesLengthRef.current === 0) {
					logErrors(error);
					setMessagesError("An unexpected error occured while loading cheets.");
				} else {
					handleErrors(error, "loading cheets", setErrors);
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
		messagesLengthRef,
		setMessages,
		setMessagesError,
		setMessagesLoading,
		fetchMessages,
		markMessagesRead,
	};
};

export default useFetchMessages;
