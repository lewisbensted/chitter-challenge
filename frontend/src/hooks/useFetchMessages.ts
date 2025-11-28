import { useCallback, useRef, useState } from "react";
import type { IMessage } from "../interfaces/interfaces";
import { serverURL } from "../config/config";
import axios from "axios";
import { logErrors } from "../utils/processErrors";
import { useIsMounted } from "../utils/isMounted";
import toast from "react-hot-toast";
import { SPINNER_DURATION } from "../config/layout";
import { throwApiError } from "../utils/apiResponseError";

interface UseFetchMessagesReturn {
	messages: IMessage[];
	isMessagesLoading: boolean;
	messagesError: boolean;
	page: number;
	refreshMessagesTrigger: boolean;
	setMessagesError: React.Dispatch<React.SetStateAction<boolean>>;
	setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>;
	fetchMessages: (isRetry?: boolean) => Promise<void>;
	hasNextPage: boolean;
	refreshMessages: () => void;
	markMessagesRead: () => Promise<void>;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	toggleRefreshMessages: React.Dispatch<React.SetStateAction<boolean>>;
}

const useFetchMessages = (interlocutorId: string): UseFetchMessagesReturn => {
	const [messages, setMessages] = useState<IMessage[]>([]);
	const [isMessagesLoading, setMessagesLoading] = useState<boolean>(true);
	const [messagesError, setMessagesError] = useState<boolean>(false);
	const [page, setPage] = useState<number>(0);
	const [hasNextPage, setHasNextPage] = useState(false);
	const [refreshMessagesTrigger, toggleRefreshMessages] = useState<boolean>(false);
	const cursorRef = useRef<string>();

	const isMounted = useIsMounted();

	const fetchMessages = useCallback(
		async (isRetry = false) => {
			setMessagesLoading(true);

			const take = page === 0 ? 20 : 10;
			const params = new URLSearchParams();
			if (cursorRef.current) params.append("cursor", cursorRef.current);
			params.append("take", take.toString());

			try {
				const res = await axios.get<{ messages: IMessage[]; hasNext: boolean }>(
					`${serverURL}/api/messages/${interlocutorId}?${params}`,
					{
						withCredentials: true,
					}
				);
				const { messages: newMessages, hasNext } = res.data;
				if (!Array.isArray(newMessages) || typeof hasNext !== "boolean")
					throwApiError({ messages: "array", hasNext: "boolean" }, res.data);

				if (isMounted.current) {
					setHasNextPage(hasNext);
					if (newMessages.length) {
						setMessages((prevMessages) => [...newMessages, ...prevMessages]);
						cursorRef.current = newMessages[0].uuid;
					}
					setMessagesError(false);
				}
			} catch (error) {
				logErrors(error);
				if (isMounted.current) setMessagesError(true);
			} finally {
				setTimeout(
					() => {
						if (isMounted.current) setMessagesLoading(false);
					},
					page === 0 || isRetry ? SPINNER_DURATION : 0
				);
			}
		},
		[page, interlocutorId]
	);

	const markMessagesFailed = useRef(false);
	const markMessagesRead = useCallback(async () => {
		try {
			await axios.put(
				`${serverURL}/api/messages/${interlocutorId}/read`,
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
	}, [interlocutorId, serverURL]);

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
	}, [interlocutorId]);

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
