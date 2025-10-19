import { useCallback, useRef, useState } from "react";
import type { IReply } from "../interfaces/interfaces";
import { serverURL } from "../config/config";
import axios from "axios";
import { logErrors } from "../utils/processErrors";
import { useIsMounted } from "../utils/isMounted";
import { SPINNER_DURATION } from "../config/layout";
import { throwApiError } from "../utils/apiResponseError";

interface UseFetchRepliesReturn {
	replies: IReply[];
	isRepliesLoading: boolean;
	repliesLengthRef: React.MutableRefObject<number>;
	repliesError: boolean;
	page: number;
	setRepliesError: React.Dispatch<React.SetStateAction<boolean>>;
	setReplies: React.Dispatch<React.SetStateAction<IReply[]>>;
	fetchReplies: (isRetry?: boolean) => Promise<void>;
	hasNextPage: boolean;
	setPage: React.Dispatch<React.SetStateAction<number>>;
}

const useFetchReplies = (cheetId: string): UseFetchRepliesReturn => {
	const [replies, setReplies] = useState<IReply[]>([]);
	const [repliesError, setRepliesError] = useState<boolean>(false);
	const [isRepliesLoading, setRepliesLoading] = useState<boolean>(true);
	const [hasNextPage, setHasNextPage] = useState(false);
	const [page, setPage] = useState<number>(0);
	const cursorRef = useRef<string>();
	const repliesLengthRef = useRef<number>(0);

	const isMounted = useIsMounted();

	const fetchReplies = useCallback(
		async (isRetry = false) => {
			setRepliesLoading(true);

			const take = 5;
			const params = new URLSearchParams();
			if (cursorRef.current) params.append("cursor", cursorRef.current);
			params.append("take", take.toString());

			try {
				const res = await axios.get<{ replies: IReply[]; hasNext: boolean }>(
					`${serverURL}/api/cheets/${cheetId}/replies?${params}`,
					{
						withCredentials: true,
					}
				);

				const { replies: newReplies, hasNext } = res.data;
				if (!Array.isArray(newReplies) || typeof hasNext !== "boolean")
					throwApiError({ replies: "array", hasNext: "boolean" }, res.data);

				if (isMounted.current) {
					setHasNextPage(hasNext);

					if (newReplies.length) {
						setReplies((replies) => {
							const updated = [...replies, ...newReplies];
							repliesLengthRef.current = updated.length;
							return updated;
						});
						cursorRef.current = newReplies[newReplies.length - 1].uuid;
					}
					setRepliesError(false);
				}
			} catch (error) {
				logErrors(error);
				if (isMounted.current) setRepliesError(true);
			} finally {
				setTimeout(
					() => {
						if (isMounted.current) setRepliesLoading(false);
					},
					page === 0 || isRetry ? SPINNER_DURATION : 0
				);
			}
		},
		[cheetId, page]
	);

	return {
		replies,
		isRepliesLoading,
		repliesError,
		repliesLengthRef,
		hasNextPage,
		page,
		setPage,
		setReplies,
		setRepliesError,
		fetchReplies,
	};
};

export default useFetchReplies;
