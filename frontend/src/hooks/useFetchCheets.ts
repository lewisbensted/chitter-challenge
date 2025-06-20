import { useCallback, useRef, useState } from "react";
import { ICheet } from "../interfaces/interfaces";
import axios from "axios";
import { serverURL } from "../config/config";
import { logErrors } from "../utils/handleErrors";

interface UseFetchCheetsReturn {
	cheets: ICheet[];
	isCheetsLoading: boolean;
	cheetsLengthRef: React.MutableRefObject<number>;
	cheetsError: string;
	setCheetsError: React.Dispatch<React.SetStateAction<string>>;
	setCheets: React.Dispatch<React.SetStateAction<ICheet[]>>;
	fetchCheets: (handleError: (error: unknown) => void, userId?: string) => Promise<void>;
	hasNextPage: boolean;
}

const useFetchCheets = (): UseFetchCheetsReturn => {
	const [isCheetsLoading, setCheetsLoading] = useState<boolean>(true);
	const [cheets, setCheets] = useState<ICheet[]>([]);
	const [cheetsError, setCheetsError] = useState<string>("");
	const [hasNextPage, setHasNextPage] = useState(false);
	const cursorRef = useRef<string>();
	const cheetsLengthRef = useRef<number>(0);

	const take = 5;

	const fetchCheets = useCallback(async (handleError: (error: unknown) => void, userId?: string) => {
		try {
			setCheetsLoading(true);

			const cursorParam = cursorRef.current ? `cursor=${cursorRef.current}` : "";
			const res = await axios.get<ICheet[]>(
				`${serverURL}${userId ? `/users/${userId}` : ""}/cheets?${cursorParam}&take=${take}`,
				{
					withCredentials: true,
				}
			);

			const newCheets = res.data;
			setHasNextPage(newCheets.length < take ? false : true);

			if (newCheets.length) {
				setCheets((cheets) => {
					const updatedCheets = [...cheets, ...newCheets];
					cheetsLengthRef.current = updatedCheets.length;
					return updatedCheets;
				});

				cursorRef.current = newCheets[newCheets.length - 1].uuid;
			}
			setCheetsError("");
		} catch (error) {
			if (cheetsLengthRef.current === 0) {
				logErrors(error);
				setCheetsError("An unexpected error occured while loading cheets.");
			} else {
				handleError(error);
				setHasNextPage(false);
			}
		} finally {
			setCheetsLoading(false);
		}
	}, []);

	return {
		cheets,
		isCheetsLoading,
		cheetsLengthRef,
		cheetsError,
		setCheets,
		setCheetsError,
		fetchCheets,
		hasNextPage,
	};
};

export default useFetchCheets;
