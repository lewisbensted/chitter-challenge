import { useCallback, useRef, useState } from "react";
import type { IReply } from "../interfaces/interfaces";
import { serverURL } from "../config/config";
import axios from "axios";
import { logErrors } from "../utils/processErrors";
import { useIsMounted } from "../utils/isMounted";
import { useError } from "../contexts/ErrorContext";

interface UseFetchRepliesReturn {
	replies: IReply[];
	isRepliesLoading: boolean;
	repliesLengthRef: React.MutableRefObject<number>;
	repliesError: string;
	page: number;
	setRepliesError: React.Dispatch<React.SetStateAction<string>>;
	setReplies: React.Dispatch<React.SetStateAction<IReply[]>>;
	fetchReplies: (take: number, userId?: string) => Promise<void>;
	hasNextPage: boolean;
	setPage: React.Dispatch<React.SetStateAction<number>>;
}

const useFetchReplies = (cheetId: string): UseFetchRepliesReturn => {
	const [replies, setReplies] = useState<IReply[]>([]);
	const [repliesError, setRepliesError] = useState<string>("");
	const [isRepliesLoading, setRepliesLoading] = useState<boolean>(true);
	const [hasNextPage, setHasNextPage] = useState(false);
	const [page, setPage] = useState<number>(0);
	const cursorRef = useRef<string>();
	const repliesLengthRef = useRef<number>(0);
	const isFirstLoad = useRef<boolean>(true);
	const { handleErrors } = useError();

	const isMounted = useIsMounted();

	const fetchReplies = useCallback(async (take: number) => {
		try {
			setRepliesLoading(true);

			const params = new URLSearchParams();
			if (cursorRef.current) params.append("cursor", cursorRef.current);
			params.append("take", take.toString());

			const res = await axios.get<{ replies: IReply[]; hasNext: boolean }>(
				`${serverURL}/api/cheets/${cheetId}/replies?${params}`,
				{
					withCredentials: true,
				}
			);

			const { replies: newReplies, hasNext } = res.data;

			if (isFirstLoad.current) {
				isFirstLoad.current = false;
			}
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
				setRepliesError("");
			}
		} catch (error) {
			if (isFirstLoad.current) {
				logErrors(error);
				if (isMounted.current) setRepliesError("An unexpected error occured while loading replies.");
			} else {
				handleErrors(error, "load replies", false);
			}
		} finally {
			if (isMounted.current) setRepliesLoading(false);
		}
	}, []);

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
