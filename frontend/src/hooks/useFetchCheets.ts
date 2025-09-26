import { useCallback, useEffect, useRef, useState } from "react";
import type { ICheet } from "../interfaces/interfaces";
import axios from "axios";
import { serverURL } from "../config/config";
import { logErrors } from "../utils/processErrors";
import { useIsMounted } from "../utils/isMounted";
import { useError } from "../contexts/ErrorContext";

interface UseFetchCheetsReturn {
	cheets: ICheet[];
	isCheetsLoading: boolean;
	cheetsError: string;
	setCheetsError: React.Dispatch<React.SetStateAction<string>>;
	setCheets: React.Dispatch<React.SetStateAction<ICheet[]>>;
	setPage: React.Dispatch<React.SetStateAction<number>>;
	hasNextPage: boolean;
}


const useFetchCheets = (pageUserId? : string): UseFetchCheetsReturn => {
	const [isCheetsLoading, setCheetsLoading] = useState<boolean>(true);
	const [cheets, setCheets] = useState<ICheet[]>([]);
	const [cheetsError, setCheetsError] = useState<string>("");
	const [hasNextPage, setHasNextPage] = useState(false);
	const cursorRef = useRef<string>();
	const isFirstLoad = useRef<boolean>(true);
	const [page, setPage] = useState<number>(0);

	const { handleErrors } = useError();

	const isMounted = useIsMounted();

	const fetchCheets = useCallback(async (take: number) => {
		try {
			setCheetsLoading(true);

			const cursorParam = cursorRef.current ? `cursor=${cursorRef.current}` : "";
			const res = await axios.get<ICheet[]>(
				`${serverURL}/api${pageUserId ? `/users/${pageUserId}` : ""}/cheets?${cursorParam}&take=${take}`,
				{
					withCredentials: true,
				}
			);

			const newCheets = res.data;

			if (isFirstLoad.current) {
				isFirstLoad.current = false;
			}

			if (isMounted.current) {
				setHasNextPage(newCheets.length >= take);

				if (newCheets.length) {
					setCheets((prevCheets) => [...prevCheets, ...newCheets]);

					cursorRef.current = newCheets[newCheets.length - 1].uuid;
				}
				setCheetsError("");
			}
		} catch (error) {
			if (isFirstLoad.current) {
				logErrors(error);
				if (isMounted.current) setCheetsError("An unexpected error occured while loading cheets.");
			} else {
				handleErrors(error, "load cheets", false);
				if (isMounted.current) setHasNextPage(false);
			}
		} finally {
			if (isMounted.current) setCheetsLoading(false);
		}
	}, []);

	useEffect(() => {
		void fetchCheets(page === 0 ? 10 : 5);
	}, [page, fetchCheets]);

	return {
		cheets,
		isCheetsLoading,
		cheetsError,
		setCheets,
		setPage,
		setCheetsError,
		hasNextPage,
	};
};

export default useFetchCheets;
