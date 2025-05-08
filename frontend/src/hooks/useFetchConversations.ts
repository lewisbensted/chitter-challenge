import { useCallback, useState } from "react";
import { serverURL } from "../config/config";
import axios from "axios";
import { IConversation } from "../interfaces/interfaces";

interface UseFetchConversationsReturn {
	conversations: IConversation[] | undefined;
	isUnreadMessages: boolean | undefined;
	conversationsError: string | undefined;
	isConversationsLoading: boolean;
	setConversations: (arg: IConversation[]) => void;
	setConversationsLoading: (arg: boolean) => void;
	setConversationsError: (arg: string) => void;
	fetchData: (
		handleError: (error: unknown) => void,
		setComponentLoading: (arg: boolean) => void,
		conversationParams?: { id?: string }
	) => Promise<void>;
}

const useFetchConversations = (): UseFetchConversationsReturn => {
	const [conversations, setConversations] = useState<IConversation[]>();
	const [isConversationsLoading, setConversationsLoading] = useState(true);
	const [isUnreadMessages, setUnreadMessages] = useState<boolean>();
	const [conversationsError, setConversationsError] = useState<string>();

	const fetchUnreadMessages = async () => {
		const res = await axios.get<boolean>(`${serverURL}/messages/unread`, { withCredentials: true });
		setUnreadMessages(res.data);
	};

	const fetchConversations = async (id?: string) => {
		const res = await axios.get<IConversation[]>(`${serverURL}/conversations${id ? "/" + id : ""}`, {
			withCredentials: true,
		});
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
				handleError(error);
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
	};
};

export default useFetchConversations;
