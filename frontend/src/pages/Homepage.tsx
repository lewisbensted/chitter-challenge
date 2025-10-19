import React, { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import SendCheet from "../components/SendCheet";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Box from "@mui/material/Box/Box";
import Cheet from "../components/Cheet";
import { Button, Typography } from "@mui/material";
import FlexBox from "../styles/FlexBox";
import useFetchCheets from "../hooks/useFetchCheets";
import CheetModal from "../components/CheetModal";
import type { ICheet } from "../interfaces/interfaces";
import { useAuth } from "../contexts/AuthContext";
import ScrollGrid from "../styles/ScrollGrid";
import { useIsMounted } from "../utils/isMounted";

const Homepage: React.FC = () => {
	const { userId } = useAuth();
	const [selectedCheet, setSelectedCheet] = useState<ICheet | null>();

	const { cheets, isCheetsLoading, cheetsError, setCheetsError, setCheets, setPage, hasNextPage, page, fetchCheets } =
		useFetchCheets();

	const [scrollTrigger, toggleScrollTrigger] = useState<boolean>(false);

	const listRef = useRef<HTMLDivElement>(null);

	const isMounted = useIsMounted();

	useLayoutEffect(() => {
		requestAnimationFrame(() => {
			if (listRef.current) {
				listRef.current.scrollTo({ top: 0, behavior: "smooth" });
			}
		});
	}, [scrollTrigger]);

	const observer = useRef<IntersectionObserver>();
	const lastCheetRef = useCallback(
		(cheet: HTMLElement | null) => {
			if (observer.current) observer.current.disconnect();
			observer.current = new IntersectionObserver((cheets) => {
				if (isCheetsLoading || cheetsError) return;
				if (cheets[0].isIntersecting && hasNextPage) {
					setPage((page) => page + 1);
				}
			});
			if (cheet) observer.current.observe(cheet);
		},
		[isCheetsLoading, hasNextPage, cheetsError, setPage]
	);

	const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
	useEffect(() => {
		if (!isCheetsLoading) setHasFetchedOnce(true);
	}, [isCheetsLoading]);

	useEffect(() => {
		void fetchCheets();
	}, [fetchCheets]);

	const message = () => {
		if (cheetsError) {
			return page === 0 ? "An unexpected error occured while loading cheets." : "Failed to load more cheets.";
		} else if (!cheets.length) {
			return "No cheets to display.";
		}
	};

	return (
		<Box>
			<Typography variant="h4">Welcome to Chitter</Typography>

			<ScrollGrid ref={listRef}>
				{hasFetchedOnce && (
					<Fragment>
						{((page === 0 && !isCheetsLoading) || page > 0) &&
							cheets.length > 0 &&
							cheets.map((cheet, index) => (
								<Cheet
									ref={cheets.length === index + 1 ? lastCheetRef : null}
									key={cheet.uuid}
									cheet={cheet}
									setCheets={setCheets}
									isModalView={false}
									setSelectedCheet={setSelectedCheet}
									isPageMounted={isMounted}
								/>
							))}
						{!isCheetsLoading && (
							<Fragment>
								<Typography variant="subtitle1">{message()}</Typography>
								{cheetsError && (
									<FlexBox>
										<Button
											onClick={() => {
												void fetchCheets(true);
											}}
											variant="contained"
										>
											<Typography variant="button">Retry</Typography>
										</Button>
									</FlexBox>
								)}
							</Fragment>
						)}
					</Fragment>
				)}

				{isCheetsLoading && (
					<FlexBox>
						<CircularProgress thickness={5} />
					</FlexBox>
				)}
			</ScrollGrid>

			{hasFetchedOnce && userId && !cheetsError && (
				<SendCheet
					setCheets={setCheets}
					setCheetsError={setCheetsError}
					triggerScroll={toggleScrollTrigger}
					isPageMounted={isMounted}
				/>
			)}

			{selectedCheet && (
				<CheetModal
					cheet={selectedCheet}
					isOpen={!!selectedCheet}
					setCheets={setCheets}
					setSelectedCheet={setSelectedCheet}
				/>
			)}
		</Box>
	);
};

export default Homepage;
