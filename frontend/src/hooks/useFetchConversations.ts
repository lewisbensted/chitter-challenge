import { useCallback, useState } from "react";
import { serverURL } from "../config/config";
import axios from "axios";
import { IConversation } from "../interfaces/interfaces";
import { logErrors } from "../utils/handleErrors";

interface UseFetchConversationsReturn {
	conversations: IConversation[];
	isUnreadMessages: boolean | undefined;
	conversationsError: string | undefined;
	isConversationsLoading: boolean;
	setConversations: React.Dispatch<React.SetStateAction<IConversation[]>>;
	setConversationsLoading: React.Dispatch<React.SetStateAction<boolean>>;
	setConversationsError: React.Dispatch<React.SetStateAction<string>>;
	fetchConversationsData: (
		setComponentLoading: React.Dispatch<React.SetStateAction<boolean>>,
		updateUnreadRef: React.MutableRefObject<boolean>,
		pageUserId?: string
	) => Promise<void>;
	fetchAndSetUnread: () => void;
}

const useFetchConversations = (): UseFetchConversationsReturn => {
	const [conversations, setConversations] = useState<IConversation[]>([]);
	const [isConversationsLoading, setConversationsLoading] = useState<boolean>(true);
	const [isUnreadMessages, setUnreadMessages] = useState<boolean>();
	const [conversationsError, setConversationsError] = useState<string>("");

	const fetchUnread = async () => {
		const res = await axios.get<boolean>(`${serverURL}/messages/unread`, { withCredentials: true });
		return res.data;
	};

	const fetchAndSetUnread = useCallback(async () => {
		try {
			const unread = await fetchUnread();
			setUnreadMessages(unread);
		} catch (error) {
			logErrors(error);
		} finally {
			setConversationsLoading(false);
		}
	}, []);

	const fetchConversations = async (id?: string) => {
		const res = await axios.get<IConversation[]>(`${serverURL}/conversations${id ? "/" + id : ""}`, {
			withCredentials: true,
		});
		return res.data;
	};

	const fetchConversationsData = useCallback(
		async (
			setComponentLoading: React.Dispatch<React.SetStateAction<boolean>>,
			updateUnreadRef: React.MutableRefObject<boolean>,
			pageUserId?: string
		) => {
			setComponentLoading(true);
			const [conversationsResult, unreadResult] = await Promise.allSettled([
				fetchConversations(pageUserId),
				updateUnreadRef.current ? fetchUnread() : Promise.resolve(undefined),
			]);

			if (conversationsResult.status === "fulfilled") {
				setConversations(conversationsResult.value);
			} else {
				logErrors(conversationsResult.reason);
				setConversationsError("An unexpected error occured while loading conversations.");
			}

			if (updateUnreadRef.current) {
				if (unreadResult.status === "fulfilled") {
					setUnreadMessages(unreadResult.value);
				} else {
					logErrors(unreadResult.reason);
				}
			}

			setComponentLoading(false);
			setConversationsLoading(false);
		},
		[]
	);

	return {
		conversations,
		isUnreadMessages,
		isConversationsLoading,
		conversationsError,
		setConversationsError,
		setConversations,
		setConversationsLoading,
		fetchAndSetUnread,
		fetchConversationsData,
	};
};

export default useFetchConversations;
