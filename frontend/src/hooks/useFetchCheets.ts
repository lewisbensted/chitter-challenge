import { useCallback, useEffect, useRef, useState } from "react";
import type { ICheet } from "../interfaces/interfaces";
import axios from "axios";
import { serverURL } from "../config/config";
import { logErrors } from "../utils/processErrors";
import { useIsMounted } from "../utils/isMounted";
import { useError } from "../contexts/ErrorContext";
import { SPINNER_DURATION } from "../config/layout";

interface UseFetchCheetsReturn {
	cheets: ICheet[];
	isCheetsLoading: boolean;
	cheetsError: string;
	setCheetsError: React.Dispatch<React.SetStateAction<string>>;
	setCheets: React.Dispatch<React.SetStateAction<ICheet[]>>;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	hasNextPage: boolean;
	page: number;
}

const useFetchCheets = (pageUserId?: string): UseFetchCheetsReturn => {
	const [isCheetsLoading, setCheetsLoading] = useState<boolean>(true);
	const [cheets, setCheets] = useState<ICheet[]>([]);
	const [cheetsError, setCheetsError] = useState<string>("");
	const [hasNextPage, setHasNextPage] = useState(false);
	const cursorRef = useRef<string>();
	const [page, setPage] = useState<number>(0);

	const { handleErrors } = useError();

	const isMounted = useIsMounted();

	const fetchCheets = useCallback(async () => {
		const take = page === 0 ? 10 : 5;

		try {
			setCheetsLoading(true);

			const params = new URLSearchParams();
			if (cursorRef.current) params.append("cursor", cursorRef.current);
			params.append("take", take.toString());

			const res = await axios.get<{ cheets: ICheet[]; hasNext: boolean }>(
				`${serverURL}/api${pageUserId ? `/users/${pageUserId}` : ""}/cheets?${params}`,
				{
					withCredentials: true,
				}
			);
			const { cheets: newCheets, hasNext } = res.data;

			if (isMounted.current) {
				setHasNextPage(hasNext);

				if (newCheets.length) {
					setCheets((prevCheets) => [...prevCheets, ...newCheets]);
					cursorRef.current = newCheets[newCheets.length - 1].uuid;
				}
				setCheetsError("");
			}
		} catch (error) {
			if (page===0) {
				logErrors(error);
				if (isMounted.current) setCheetsError("An unexpected error occured while loading cheets.");
			} else {
				handleErrors(error, "load cheets", false);
			}
		} finally {
			setTimeout(
				() => {
					setCheetsLoading(false);
				},
				page === 0 ? SPINNER_DURATION  : 0
			);
		}
	}, [page, pageUserId]);

	useEffect(() => {
		void fetchCheets();
	}, [fetchCheets]);

	return {
		cheets,
		isCheetsLoading,
		cheetsError,
		setCheets,
		setPage,
		setCheetsError,
		hasNextPage,
		page,
	};
};

export default useFetchCheets;
