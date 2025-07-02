import React, { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Layout from "./Layout";
import SendCheet from "../components/SendCheet";
import ErrorModal from "../components/ErrorModal";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Box from "@mui/material/Box/Box";
import Cheet from "../components/Cheet";
import { Grid2, Typography } from "@mui/material";
import FlexBox from "../styles/FlexBox";
import useValidateUser from "../hooks/useValidateUser";
import useFetchCheets from "../hooks/useFetchCheets";
import useFetchConversations from "../hooks/useFetchConversations";
import CheetModal from "../components/CheetModal";
import { ICheet } from "../interfaces/interfaces";

const Homepage: React.FC = () => {
	const [isComponentLoading, setComponentLoading] = useState<boolean>(false);
	const [errors, setErrors] = useState<string[]>([]);
	const [page, setPage] = useState<number>(0);

	const { userId, isValidateLoading, setUserId, setValidateLoading, validateUser } = useValidateUser();

	const {
		cheets,
		isCheetsLoading,
		cheetsLengthRef,
		cheetsError,
		setCheetsError,
		setCheets,
		fetchCheets,
		hasNextPage,
	} = useFetchCheets();

	const { isUnreadMessages, isConversationsLoading, fetchAndSetUnread, setConversationsLoading } =
		useFetchConversations();

	const [selectedCheet, setSelectedCheet] = useState<ICheet | null>();

	useEffect(() => {
		void validateUser(setErrors);
	}, [validateUser]);

	useEffect(() => {
		if (userId === undefined) {
			return;
		} else if (userId === null) {
			setConversationsLoading(false);
			return;
		}
		fetchAndSetUnread();
	}, [userId, setConversationsLoading, fetchAndSetUnread]);

	useEffect(() => {
		void fetchCheets(setErrors, page === 0 ? 10 : 5);
	}, [page, fetchCheets]);

	const [scrollTrigger, toggleScrollTrigger] = useState<boolean>(false);

	const listRef = useRef<HTMLDivElement>(null);

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
			if (isCheetsLoading) return;
			if (observer.current) observer.current.disconnect();
			observer.current = new IntersectionObserver((cheets) => {
				if (cheets[0].isIntersecting && hasNextPage) {
					setPage((page) => page + 1);
				}
			});
			if (cheet) observer.current.observe(cheet);
		},
		[isCheetsLoading, hasNextPage]
	);

	return (
		<Layout
			userId={userId}
			setUserId={setUserId}
			isValidationLoading={isValidateLoading || isConversationsLoading}
			isComponentLoading={isComponentLoading}
			setPageLoading={setValidateLoading}
			isUnreadMessages={isUnreadMessages}
		>
			<Box>
				<ErrorModal
					errors={errors}
					closeModal={() => {
						setErrors([]);
					}}
				/>
				<Typography variant="h4">Welcome to Chitter</Typography>

				{isValidateLoading || isConversationsLoading ? (
					<FlexBox>
						<CircularProgress thickness={5} />
					</FlexBox>
				) : (
					<Fragment>
						{cheetsError ? (
							<Typography variant="subtitle1">{cheetsError}</Typography>
						) : (
							<Grid2 ref={listRef} sx={{ overflowY: "auto", maxHeight: 500, scrollbarGutter: "stable" }}>
								{cheets.map((cheet, index) => (
									<Cheet
										ref={cheets.length === index + 1 ? lastCheetRef : null}
										key={cheet.uuid}
										cheet={cheet}
										cheets={cheets}
										userId={userId}
										setCheets={setCheets}
										setErrors={setErrors}
										setComponentLoading={setComponentLoading}
										isComponentLoading={isComponentLoading}
										isModalView={false}
										numberOfCheets={cheets.length}
										setSelectedCheet={setSelectedCheet}
									/>
								))}
								{isCheetsLoading && (
									<FlexBox>
										<CircularProgress thickness={5} />
									</FlexBox>
								)}
							</Grid2>
						)}

						{userId && !cheetsError && (
							<SendCheet
								isDisabled={isComponentLoading || isCheetsLoading}
								setCheets={setCheets}
								setCheetsError={setCheetsError}
								setErrors={setErrors}
								setComponentLoading={setComponentLoading}
								cheetsLengthRef={cheetsLengthRef}
								triggerScroll={toggleScrollTrigger}
							/>
						)}

						{selectedCheet && (
							<CheetModal
								cheet={selectedCheet}
								cheets={cheets}
								userId={userId}
								isOpen={!!selectedCheet}
								closeModal={() => {
									setSelectedCheet(null);
								}}
								setCheets={setCheets}
								isComponentLoading={isComponentLoading}
								setComponentLoading={setComponentLoading}
								numberOfCheets={cheets.length}
								setSelectedCheet={setSelectedCheet}
							/>
						)}
					</Fragment>
				)}
			</Box>
		</Layout>
	);
};

export default Homepage;
