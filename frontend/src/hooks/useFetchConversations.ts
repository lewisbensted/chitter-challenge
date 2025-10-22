import { useCallback, useRef, useState } from "react";
import { serverURL } from "../config/config";
import axios from "axios";
import type { IConversation, IMessage } from "../interfaces/interfaces";
import { logErrors } from "../utils/processErrors";
import { useIsMounted } from "../utils/isMounted";
import { SPINNER_DURATION } from "../config/layout";
import { throwApiError } from "../utils/apiResponseError";

interface UseFetchConversationsReturn {
	conversations: Map<string, IConversation>;
	conversationsError: boolean;
	isConversationsLoading: boolean;
	setConversations: React.Dispatch<React.SetStateAction<Map<string, IConversation>>>;
	fetchConversations: (userIds?: string[], isRetry?: boolean) => Promise<void>;
	setConversationsLoading: React.Dispatch<React.SetStateAction<boolean>>;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	hasNextPage: boolean;
	page: number;
	refreshConversations: (
		interlocutorId: string,
		additionalParams?: {
			sort?: boolean | undefined;
			unread?: boolean | undefined;
			latestMessage?: IMessage | undefined;
		}
	) => void;
}

const useFetchConversations = (): UseFetchConversationsReturn => {
	// using a map for conversations for faster lookup when searching for users
	const [conversations, setConversations] = useState<Map<string, IConversation>>(new Map<string, IConversation>());
	const [isConversationsLoading, setConversationsLoading] = useState<boolean>(false);
	const [conversationsError, setConversationsError] = useState<boolean>(false);

	const cursorRef = useRef<string>();
	const [page, setPage] = useState<number>(0);
	const [hasNextPage, setHasNextPage] = useState(false);

	const isMounted = useIsMounted();

	const fetchConversations = useCallback(
		async (userIds?: string[], isRetry = false) => {
			if (!isConversationsLoading) setConversationsLoading(true);

			const take = page === 0 ? 10 : 5;
			const params = new URLSearchParams();
			if (userIds?.length) params.append("userIds", userIds.join(","));
			if (cursorRef.current) params.append("cursor", cursorRef.current);
			params.append("take", take.toString());

			try {
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
					if (newConvos.length) cursorRef.current = newConvos[newConvos.length - 1].key;

					setConversations(
						(prevConvos) =>
							new Map([
								...prevConvos,
								...new Map(newConvos.map((convo) => [convo.interlocutorId, convo])),
							])
					);

					setConversationsError(false);
				}
			} catch (error) {
				logErrors(error);
				if (isMounted.current) setConversationsError(true);
			} finally {
				setTimeout(
					() => {
						if (isMounted.current) setConversationsLoading(false);
					},
					(page === 0 && !userIds?.length) || isRetry ? SPINNER_DURATION : 0
				);
			}
		},
		[page]
	);

	const refreshConversations = useCallback(
		(
			interlocutorId: string,
			additionalParams: { sort?: boolean; unread?: boolean; latestMessage?: IMessage } = {}
		) => {
			setConversations((prevConvos) => {
				const { sort, unread, latestMessage } = additionalParams;
				const newConvos = new Map(prevConvos);
				const convoToUpdate = prevConvos.get(interlocutorId);
				if (convoToUpdate)
					newConvos.set(interlocutorId, {
						...convoToUpdate,
						latestMessage: latestMessage ?? convoToUpdate.latestMessage,
						unread: unread ?? convoToUpdate.unread,
					});
				if (sort) {
					return new Map(
						Array.from(newConvos.values())
							.sort((a, b) => {
								const aTime = new Date(a.latestMessage?.createdAt ?? 0).getTime();
								const bTime = new Date(b.latestMessage?.createdAt ?? 0).getTime();
								return bTime - aTime;
							})
							.map((convo) => [convo.interlocutorId, convo])
					);
				}

				return newConvos;
			});
		},
		[setConversations]
	);

	return {
		conversations,
		fetchConversations,
		isConversationsLoading,
		conversationsError,
		setConversations,
		setConversationsLoading,
		setPage,
		hasNextPage,
		page,
		refreshConversations,
	};
};

export default useFetchConversations;
