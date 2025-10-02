import { useCallback, useRef, useState } from "react";
import type { IMessage } from "../interfaces/interfaces";
import { serverURL } from "../config/config";
import axios from "axios";
import { logErrors } from "../utils/processErrors";
import { useIsMounted } from "../utils/isMounted";
import { useError } from "../contexts/ErrorContext";
import toast from "react-hot-toast";

interface UseFetchMessagesReturn {
	messages: IMessage[];
	isMessagesLoading: boolean;
	messagesError: string;
	page: number;
	refreshMessagesTrigger: boolean;
	setMessagesError: React.Dispatch<React.SetStateAction<string>>;
	setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>;
	fetchMessages: () => Promise<void>;
	hasNextPage: boolean;
	refreshMessages: () => void;
	markMessagesRead: () => Promise<void>;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	toggleRefreshMessages: React.Dispatch<React.SetStateAction<boolean>>;
}

const useFetchMessages = (interlocutorId: string): UseFetchMessagesReturn => {
	const [messages, setMessages] = useState<IMessage[]>([]);
	const [isMessagesLoading, setMessagesLoading] = useState<boolean>(true);
	const [messagesError, setMessagesError] = useState<string>("");
	const [page, setPage] = useState<number>(0);
	const [hasNextPage, setHasNextPage] = useState(false);
	const [refreshMessagesTrigger, toggleRefreshMessages] = useState<boolean>(false);
	const cursorRef = useRef<string>();

	const isFirstLoad = useRef<boolean>(true);

	const { handleErrors } = useError();

	const isMounted = useIsMounted();

	const fetchMessages = useCallback(async () => {
		const take = page === 0 ? 20 : 10;
		try {
			setMessagesLoading(true);

			const params = new URLSearchParams();
			if (cursorRef.current) params.append("cursor", cursorRef.current);
			params.append("take", take.toString());

			const res = await axios.get<{ messages: IMessage[]; hasNext: boolean }>(
				`${serverURL}/api/messages/${interlocutorId}?${params}`,
				{
					withCredentials: true,
				}
			);
			const { messages: newMessages, hasNext } = res.data;
			if (isFirstLoad.current) {
				isFirstLoad.current = false;
			}

			if (isMounted.current) {
				setHasNextPage(hasNext);
				if (newMessages.length) {
					setMessages((prevMessages) => [...newMessages, ...prevMessages]);
					cursorRef.current = newMessages[0].uuid;
				}
				setMessagesError("");
			}
		} catch (error) {
			if (isFirstLoad.current) {
				logErrors(error);
				if (isMounted.current) setMessagesError("An unexpected error occurred while loading messages.");
			} else {
				handleErrors(error, "load messages", false);
			}
		} finally {
			if (isMounted.current) setMessagesLoading(false);
		}
	}, [page, interlocutorId]);

	const markMessagesFailed = useRef(false);
	const markMessagesRead = useCallback(async () => {
		try {
			await axios.put(
				`${serverURL}/api/messages/read/${interlocutorId}`,
				{},
				{
					withCredentials: true,
				}
			);
		} catch (error) {
			logErrors(error);
			toast("Failed to mark messages read - may be displaying outdated information.");
			markMessagesFailed.current = true;
		}
	}, []);

	const refreshMessages = useCallback(() => {
		if (markMessagesFailed.current) return;
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
		page,
		refreshMessagesTrigger,
		toggleRefreshMessages,
		setMessages,
		setMessagesError,
		fetchMessages,
		refreshMessages,
		markMessagesRead,
		setPage,
	};
};

export default useFetchMessages;
