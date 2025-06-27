import { useCallback, useState } from "react";
import { serverURL } from "../config/config";
import axios from "axios";
import { IConversation } from "../interfaces/interfaces";
import { handleErrors, logErrors } from "../utils/handleErrors";

interface UseFetchConversationsReturn {
	conversations: IConversation[];
	isUnreadMessages: boolean | undefined;
	conversationsError: string | undefined;
	isConversationsLoading: boolean;
	setConversations: React.Dispatch<React.SetStateAction<IConversation[]>>;
	setConversationsLoading: React.Dispatch<React.SetStateAction<boolean>>;
	setConversationsError: React.Dispatch<React.SetStateAction<string>>;
	fetchConversationsData: (
		setErrors: React.Dispatch<React.SetStateAction<string[]>>,
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
			setErrors: React.Dispatch<React.SetStateAction<string[]>>,
			setComponentLoading: React.Dispatch<React.SetStateAction<boolean>>,
			updateUnreadRef: React.MutableRefObject<boolean>,
			pageUserId?: string
		) => {
			try {
				setComponentLoading(true);
				const [conversations, unread] = await Promise.all([
					fetchConversations(pageUserId),
					updateUnreadRef.current ? fetchUnread() : Promise.resolve(undefined),
				]);
				setConversations(conversations);
				if (unread !== undefined) {
					setUnreadMessages(unread);
				}
			} catch (error) {
				handleErrors(error, "fetching conversations", setErrors);
			} finally {
				setComponentLoading(false);
				setConversationsLoading(false);
			}
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
