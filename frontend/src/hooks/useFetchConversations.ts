import { useCallback, useState } from "react";
import { serverURL } from "../config/config";
import axios from "axios";
import { IConversation } from "../interfaces/interfaces";
import { logErrors } from "../utils/processErrors";
import { useIsMounted } from "../utils/isMounted";

interface UseFetchConversationsReturn {
	conversations: IConversation[];
	conversationsError: string | undefined;
	isConversationsLoading: boolean;
	setConversations: React.Dispatch<React.SetStateAction<IConversation[]>>;
	setConversationsLoading: React.Dispatch<React.SetStateAction<boolean>>;
	setConversationsError: React.Dispatch<React.SetStateAction<string>>;
	fetchConversations: (pageUserId?: string) => Promise<void>;
}

const useFetchConversations = (): UseFetchConversationsReturn => {
	const [conversations, setConversations] = useState<IConversation[]>([]);
	const [isConversationsLoading, setConversationsLoading] = useState<boolean>(true);

	const [conversationsError, setConversationsError] = useState<string>("");

	const isMounted = useIsMounted();

	const fetchConversations = useCallback(async (pageUserId?: string) => {
		try {
			const res = await axios.get<IConversation[]>(
				`${serverURL}/conversations${pageUserId ? "/" + pageUserId : ""}`,
				{
					withCredentials: true,
				}
			);
			if (isMounted()) setConversations(res.data);
		} catch (error) {
			logErrors(error);
			if (isMounted()) setConversationsError("An unexpected error occured while loading conversations.");
		} finally {
			if (isMounted()) setConversationsLoading(false);
		}
	}, []);

	return {
		conversations,
		isConversationsLoading,
		conversationsError,
		setConversationsError,
		setConversations,
		setConversationsLoading,
		fetchConversations,
	};
};

export default useFetchConversations;
