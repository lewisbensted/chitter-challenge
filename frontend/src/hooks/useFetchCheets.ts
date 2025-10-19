import { useCallback, useRef, useState } from "react";
import type { ICheet } from "../interfaces/interfaces";
import axios from "axios";
import { serverURL } from "../config/config";
import { logErrors } from "../utils/processErrors";
import { useIsMounted } from "../utils/isMounted";
import { SPINNER_DURATION } from "../config/layout";
import { throwApiError } from "../utils/apiResponseError";

interface UseFetchCheetsReturn {
	cheets: ICheet[];
	isCheetsLoading: boolean;
	cheetsError: boolean;
	setCheetsError: React.Dispatch<React.SetStateAction<boolean>>;
	setCheets: React.Dispatch<React.SetStateAction<ICheet[]>>;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	hasNextPage: boolean;
	page: number;
	fetchCheets: (isRetry?: boolean) => Promise<void>;
}

const useFetchCheets = (pageUserId?: string): UseFetchCheetsReturn => {
	const [isCheetsLoading, setCheetsLoading] = useState<boolean>(true);
	const [cheets, setCheets] = useState<ICheet[]>([]);
	const [cheetsError, setCheetsError] = useState<boolean>(false);
	const [hasNextPage, setHasNextPage] = useState(false);
	const cursorRef = useRef<string>();
	const [page, setPage] = useState<number>(0);

	const isMounted = useIsMounted();

	const fetchCheets = useCallback(
		async (isRetry = false) => {
			setCheetsLoading(true);
			
			const take = page === 0 ? 10 : 5;
			const params = new URLSearchParams();
			if (cursorRef.current) params.append("cursor", cursorRef.current);
			params.append("take", take.toString());

			try {
				const res = await axios.get<{ cheets: ICheet[]; hasNext: boolean }>(
					`${serverURL}/api${pageUserId ? `/users/${pageUserId}` : ""}/cheets?${params}`,
					{
						withCredentials: true,
					}
				);

				const { cheets: newCheets, hasNext } = res.data;
				if (!Array.isArray(newCheets) || typeof hasNext !== "boolean")
					throwApiError({ cheets: "array", hasNext: "boolean" }, res.data);

				if (isMounted.current) {
					setHasNextPage(hasNext);

					if (newCheets.length) {
						setCheets((prevCheets) => [...prevCheets, ...newCheets]);
						cursorRef.current = newCheets[newCheets.length - 1].uuid;
					}
					setCheetsError(false);
				}
			} catch (error) {
				logErrors(error);
				if (isMounted.current) setCheetsError(true);
			} finally {
				setTimeout(
					() => {
						if (isMounted.current) setCheetsLoading(false);
					},
					page === 0 || isRetry ? SPINNER_DURATION : 0
				);
			}
		},
		[page, pageUserId]
	);

	return {
		cheets,
		isCheetsLoading,
		cheetsError,
		setCheets,
		setPage,
		setCheetsError,
		hasNextPage,
		page,
		fetchCheets,
	};
};

export default useFetchCheets;
