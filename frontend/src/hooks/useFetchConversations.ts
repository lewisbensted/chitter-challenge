import { useCallback, useRef, useState } from "react";
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
	fetchData: (
		handleError: (error: unknown) => void,
		setComponentLoading: React.Dispatch<React.SetStateAction<boolean>>,
		conversationParams?: { id?: string }
	) => Promise<void>;
	conversationErrorOnClose: React.MutableRefObject<boolean>;
}

const useFetchConversations = (): UseFetchConversationsReturn => {
	const [conversations, setConversations] = useState<IConversation[]>([]);
	const [isConversationsLoading, setConversationsLoading] = useState<boolean>(true);
	const [isUnreadMessages, setUnreadMessages] = useState<boolean>();
	const [conversationsError, setConversationsError] = useState<string>("");

	const conversationErrorOnClose = useRef(false);

	const fetchUnreadMessages = async () => {
		const res = await axios.get<boolean>(`${serverURL}/messages/unread`, { withCredentials: true });
		setUnreadMessages(res.data);
	};

	const fetchConversations = async (id?: string) => {
		const res = await axios.get<IConversation[]>(`${serverURL}/conversations${id ? "/" + id : ""}`, {
			withCredentials: true,
		});
		console.log(res)
		setConversations(res.data);
	};

	const fetchData = useCallback(
		async (
			handleError: (error: unknown) => void,
			setComponentLoading: (arg: boolean) => void,
			conversationParams?: { id?: string }
		) => {
			const { id } = conversationParams ?? {};

			try {
				setComponentLoading(true);
				await Promise.all([fetchUnreadMessages(), conversationParams ? fetchConversations(id) : null]);
			} catch (error) {
				if (conversationErrorOnClose.current || id) {
					handleError(error);
				} else {
					logErrors(error);
					setConversationsError("An unexpected error occured while loading conversations.");
				}
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
		fetchData,
		conversationErrorOnClose,
	};
};

export default useFetchConversations;
