import { useCallback, useRef, useState } from "react";
import { IMessage } from "../interfaces/interfaces";
import { serverURL } from "../config/config";
import axios from "axios";
import { logErrors } from "../utils/processErrors";
import { useIsMounted } from "../utils/isMounted";
import { useError } from "../contexts/ErrorContext";

interface UseFetchMessagesReturn {
	messages: IMessage[];
	isMessagesLoading: boolean;
	messagesError: string;
	setMessagesError: React.Dispatch<React.SetStateAction<string>>;
	setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>;
	fetchMessages: (
		interlocutorId: string,
		take: number
	) => Promise<void>;
	hasNextPage: boolean;
	setMessagesLoading: React.Dispatch<React.SetStateAction<boolean>>;
	refreshMessages: (interlocutorId: string) => void;
	markMessagesRead: (interlocutorId: string) => Promise<void>;
}

const useFetchMessages = (): UseFetchMessagesReturn => {
	const [messages, setMessages] = useState<IMessage[]>([]);
	const [isMessagesLoading, setMessagesLoading] = useState<boolean>(true);
	const [messagesError, setMessagesError] = useState<string>("");
	const [hasNextPage, setHasNextPage] = useState(false);
	const cursorRef = useRef<string>();
	const hasLoadedOnceRef = useRef<boolean>(false);

	const { handleErrors } = useError();

	const isMounted = useIsMounted();

	const fetchMessages = useCallback(
		async (interlocutorId: string, take: number) => {
			try {
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

				if (isMounted()) {
					setHasNextPage(newMessages.length >= take);
					if (newMessages.length) {
						setMessages((prevMessages) => [...newMessages, ...prevMessages]);
						cursorRef.current = newMessages[0].uuid;
					}
					setMessagesError("");
				}
			} catch (error) {
				if (!hasLoadedOnceRef.current) {
					logErrors(error);
					if (isMounted()) setMessagesError("An unexpected error occurred while loading messages.");
				} else {
					handleErrors(error, "loading messages");
					if (isMounted()) setHasNextPage(false);
				}
			} finally {
				if (isMounted()) setMessagesLoading(false);
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

	const refreshMessages = useCallback((interlocutorId: string) => {
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
		refreshMessages,
		markMessagesRead,
	};
};

export default useFetchMessages;
