import { useCallback, useRef, useState } from "react";
import { serverURL } from "../config/config";
import axios from "axios";
import type { IConversation } from "../interfaces/interfaces";
import { logErrors } from "../utils/processErrors";
import { useIsMounted } from "../utils/isMounted";
import toast from "react-hot-toast";
import { mergeAndSortConvos } from "../utils/mergeAndSortConvos";
import { SPINNER_DURATION } from "../config/layout";

interface UseFetchConversationsReturn {
	conversations: Map<string, IConversation>;
	conversationsError: string | undefined;
	isConversationsLoading: boolean;
	setConversations: React.Dispatch<React.SetStateAction<Map<string, IConversation>>>;
	toggleConversationsTrigger: React.Dispatch<React.SetStateAction<boolean>>;
	fetchConversations: (userIds?: string[], isRefresh?: boolean, replace?: boolean, sort?: boolean) => Promise<void>;
	reloadConversationsTrigger: boolean;
	setConversationsLoading: React.Dispatch<React.SetStateAction<boolean>>;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	hasNextPage: boolean;
	page: number;
}

const useFetchConversations = (): UseFetchConversationsReturn => {
	const [conversations, setConversations] = useState<Map<string, IConversation>>(new Map<string, IConversation>());
	const [isConversationsLoading, setConversationsLoading] = useState<boolean>(false);
	const [reloadConversationsTrigger, toggleConversationsTrigger] = useState<boolean>(false);
	const [conversationsError, setConversationsError] = useState<string>("");

	const cursorRef = useRef<string>();
	const [page, setPage] = useState<number>(0);
	const [hasNextPage, setHasNextPage] = useState(false);

	const isMounted = useIsMounted();

	const fetchConversations = useCallback(
		async (userIds?: string[], isRefresh = false, sort = false) => {
			const take = page === 0 ? 10 : 5;
			if (!isRefresh && !isConversationsLoading) setConversationsLoading(true);
			try {
				const params = new URLSearchParams();
				if (userIds?.length) params.append("userIds", userIds.join(","));
				if (cursorRef.current) params.append("cursor", cursorRef.current);
				params.append("take", take.toString());

				const res = await axios.get<{ conversations: IConversation[]; hasNext: boolean }>(
					`${serverURL}/api/conversations?${params}`,
					{
						withCredentials: true,
					}
				);

				const { conversations, hasNext } = res.data;

				if (isMounted.current) {
					setHasNextPage(hasNext);
					const newConvos = new Map(conversations.map((convo) => [convo.interlocutorId, convo]));
					const newConvosArray = Array.from(newConvos.values());
					if (newConvosArray.length) cursorRef.current = newConvosArray[newConvosArray.length - 1].key;

					setConversations((prevConvos) =>
						mergeAndSortConvos(sort, newConvos, page > 0 || isRefresh ? prevConvos : undefined)
					);

					setConversationsError("");
				}
			} catch (error) {
				logErrors(error);
				if (isMounted.current) {
					if (isRefresh) toast("Failed to refresh conversations - may be displaying outdated information.");
					else setConversationsError("An unexpected error occured while loading conversations.");
				}
			} finally {
				setTimeout(
					() => {
						setConversationsLoading(false);
					},
					page === 0 && !userIds?.length ? SPINNER_DURATION : 0
				);
			}
		},
		[page]
	);

	return {
		conversations,
		fetchConversations,
		reloadConversationsTrigger,
		isConversationsLoading,
		conversationsError,
		toggleConversationsTrigger,
		setConversations,
		setConversationsLoading,
		setPage,
		hasNextPage,
		page,
	};
};

export default useFetchConversations;
