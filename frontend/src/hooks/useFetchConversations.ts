import { useCallback, useRef, useState } from "react";
import { serverURL } from "../config/config";
import axios from "axios";
import type { IConversation } from "../interfaces/interfaces";
import { logErrors } from "../utils/processErrors";
import { useIsMounted } from "../utils/isMounted";
import { mergeAndSortConvos } from "../utils/mergeAndSortConvos";
import { SPINNER_DURATION } from "../config/layout";
import { throwApiError } from "../utils/apiResponseError";

interface UseFetchConversationsReturn {
	conversations: Map<string, IConversation>;
	conversationsError: boolean;
	isConversationsLoading: boolean;
	setConversations: React.Dispatch<React.SetStateAction<Map<string, IConversation>>>;
	toggleConversationsTrigger: React.Dispatch<React.SetStateAction<boolean>>;
	fetchConversations: (userIds?: string[], additionalParams?: AdditionalParams) => Promise<void>;
	reloadConversationsTrigger: boolean;
	setConversationsLoading: React.Dispatch<React.SetStateAction<boolean>>;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	hasNextPage: boolean;
	page: number;
}

interface AdditionalParams {
	isRefresh?: boolean;
	isRetry?: boolean;
	sort?: boolean;
}

const useFetchConversations = (): UseFetchConversationsReturn => {
	const [conversations, setConversations] = useState<Map<string, IConversation>>(new Map<string, IConversation>());
	const [isConversationsLoading, setConversationsLoading] = useState<boolean>(false);
	const [reloadConversationsTrigger, toggleConversationsTrigger] = useState<boolean>(false);
	const [conversationsError, setConversationsError] = useState<boolean>(false);

	const cursorRef = useRef<string>();
	const [page, setPage] = useState<number>(0);
	const [hasNextPage, setHasNextPage] = useState(false);

	const isMounted = useIsMounted();

	const fetchConversations = useCallback(
		async (userIds?: string[], { isRefresh = false, sort = false, isRetry = false }: AdditionalParams = {}) => {
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

				const { conversations: newConvos, hasNext } = res.data;	
				if (!Array.isArray(newConvos) || typeof hasNext !== "boolean")
					throwApiError({ conversations: "array", hasNext: "boolean" }, res.data);

				if (isMounted.current) {
					setHasNextPage(hasNext);
					const newConvosMap = new Map(newConvos.map((convo) => [convo.interlocutorId, convo]));
					// using a map for conversations for faster lookup when searching for users
					if (newConvos.length) cursorRef.current = newConvos[newConvos.length - 1].key;

					setConversations((prevConvos) =>
						mergeAndSortConvos(sort, newConvosMap, page > 0 || isRefresh ? prevConvos : undefined)
					);

					setConversationsError(false);
				}
			} catch (error) {
				logErrors(error);
				if (!isRefresh) setConversationsError(true);
			} finally {
				setTimeout(
					() => {
						setConversationsLoading(false);
					},
					(page === 0 && !userIds?.length) || isRetry ? SPINNER_DURATION : 0
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
