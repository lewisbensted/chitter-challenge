import { useCallback, useRef, useState } from "react";
import { IReply } from "../interfaces/interfaces";
import { serverURL } from "../config/config";
import axios from "axios";
import { handleErrors, logErrors } from "../utils/handleErrors";

interface UseFetchRepliesReturn {
	replies: IReply[];
	isRepliesLoading: boolean;
	repliesLengthRef: React.MutableRefObject<number>;
	repliesError: string;
	setRepliesError: React.Dispatch<React.SetStateAction<string>>;
	setReplies: React.Dispatch<React.SetStateAction<IReply[]>>;
	setRepliesLoading: React.Dispatch<React.SetStateAction<boolean>>;
	fetchReplies: (
		cheetId: string,
		setErrors: React.Dispatch<React.SetStateAction<string[]>>,
		take: number,
		userId?: string
	) => Promise<void>;
	hasNextPage: boolean;
}

const useFetchReplies = (): UseFetchRepliesReturn => {
	const [replies, setReplies] = useState<IReply[]>([]);
	const [repliesError, setRepliesError] = useState<string>("");
	const [isRepliesLoading, setRepliesLoading] = useState<boolean>(true);
	const [hasNextPage, setHasNextPage] = useState(false);
	const cursorRef = useRef<string>();
	const repliesLengthRef = useRef<number>(0);

	const fetchReplies = useCallback(
		async (cheetId: string, setErrors: React.Dispatch<React.SetStateAction<string[]>>, take: number) => {
			try {
				const res = await axios.get<IReply[]>(
					`${serverURL}/cheets/${cheetId}/replies?${cursorRef.current ? `cursor=${cursorRef.current}` : ""}&take=${take}`,
					{
						withCredentials: true,
					}
				);
				const newReplies = res.data;
				setHasNextPage(newReplies.length < take ? false : true);

				if (newReplies.length) {
					setReplies((replies) => {
						const updated = [...replies, ...newReplies];
						repliesLengthRef.current = updated.length;
						return updated;
					});
					cursorRef.current = newReplies[newReplies.length - 1].uuid;
				}
			} catch (error) {
				if (repliesLengthRef.current === 0) {
					logErrors(error);
					setRepliesError("An unexpected error occured while loading replies.");
				} else {
					handleErrors(error, "loading replies", setErrors);
					setHasNextPage(false);
				}
			} finally {
				setRepliesLoading(false);
			}
		},
		[]
	);

	return {
		replies,
		isRepliesLoading,
		repliesError,
		repliesLengthRef,
		hasNextPage,
		setReplies,
		setRepliesLoading,
		setRepliesError,
		fetchReplies,
	};
};

export default useFetchReplies;
