import React, { Fragment, useEffect, useRef, useState } from "react";
import Layout from "./Layout";
import SubmitCheet from "../components/SendCheet";
import ErrorModal from "../components/ErrorModal";
import { handleErrors } from "../utils/handleErrors";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Box from "@mui/material/Box/Box";
import Cheet from "../components/Cheet";
import { Button, Grid2, Typography } from "@mui/material";
import FlexBox from "../styles/FlexBox";
import useValidateUser from "../hooks/useValidateUser";
import useFetchCheets from "../hooks/useFetchCheets";
import useFetchConversations from "../hooks/useFetchConversations";

const Homepage: React.FC = () => {
	const [isComponentLoading, setComponentLoading] = useState<boolean>(false);
	const [errors, setErrors] = useState<string[]>([]);
	const [scrollUp, setScrollUp] = useState<boolean>(false);
	const [scrollDown, setScrollDown] = useState<boolean>(false);
	const [page, setPage] = useState<number>(0);
	const [reloadCheetsTrigger, toggleReloadTrigger] = useState<boolean>(false);

	const divRef = useRef<HTMLDivElement>(null);

	const { userId, isValidateLoading, setUserId, setValidateLoading, validateUser } = useValidateUser();

	const {
		cheets,
		isCheetsLoading,
		cheetsLengthRef,
		cheetsErrorOnModalClose,
		cheetsError,
		setCheetsError,
		setCheets,
		refreshCheets,
		loadMoreCheets,
	} = useFetchCheets();

	const { isUnreadMessages, isConversationsLoading, setConversationsLoading, fetchData } = useFetchConversations();

	useEffect(() => {
		void validateUser((error) => {
			handleErrors(error, "fetching page information", setErrors);
		});
	}, [validateUser]);

	useEffect(() => {
		if (userId === undefined) {
			return;
		} else if (userId === null) {
			setConversationsLoading(false);
			return;
		}
		void fetchData((error) => {
			handleErrors(error, "fetching messages", setErrors);
		}, setComponentLoading);
	}, [userId, fetchData, setConversationsLoading]);

	useEffect(() => {
		void loadMoreCheets((error) => {
			handleErrors(error, "loading cheets", setErrors);
		});
	}, [page, loadMoreCheets]);

	const hasFetchedCheetsOnce = useRef<boolean>(false);
	useEffect(() => {
		if (!hasFetchedCheetsOnce.current) {
			hasFetchedCheetsOnce.current = true;
			return;
		}
		void refreshCheets((error) => {
			handleErrors(error, "updating cheets", setErrors);
		}, setComponentLoading);
	}, [reloadCheetsTrigger, refreshCheets]);

	useEffect(() => {
		if (scrollUp) {
			divRef.current?.firstElementChild?.scrollIntoView();
			setScrollUp(false);
		} else if (scrollDown) {
			divRef.current?.lastElementChild?.scrollIntoView();
			setScrollDown(false);
		}
	}, [cheets, scrollUp, scrollDown]);

	return (
		<Layout
			userId={userId}
			setUserId={setUserId}
			isValidationLoding={isValidateLoading}
			isComponentLoading={isComponentLoading}
			setPageLoading={setValidateLoading}
			isUnreadMessages={isUnreadMessages}
		>
			<Box>
				<ErrorModal
					errors={errors}
					closeModal={() => {
						setErrors([]);
						setCheetsError(cheetsErrorOnModalClose.current);
						cheetsErrorOnModalClose.current = "";
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
							<Grid2 ref={divRef} sx={{ overflowY: "auto", maxHeight: 500, scrollbarGutter: "stable" }}>
								{cheets.map((cheet) => (
									<Cheet
										key={cheet.uuid}
										cheet={cheet}
										userId={userId}
										setCheets={setCheets}
										setErrors={setErrors}
										setComponentLoading={setComponentLoading}
										isComponentLoading={isComponentLoading}
										isModalView={false}
										numberOfCheets={cheets.length}
										reloadTrigger={reloadCheetsTrigger}
										toggleReloadTrigger={toggleReloadTrigger}
									/>
								))}
								{isCheetsLoading ? (
									<FlexBox>
										<CircularProgress thickness={5} />
									</FlexBox>
								) : null}
							</Grid2>
						)}

						<Button
							onClick={() => {
								setPage(page + 1);
							}}
						>
							LOAD MORE
						</Button>
						{userId ? (
							<SubmitCheet
								isDisabled={isComponentLoading || isCheetsLoading}
								setCheets={setCheets}
								setCheetsError={setCheetsError}
								setErrors={setErrors}
								setComponentLoading={setComponentLoading}
								setScroll={setScrollUp}
								cheetsLengthRef={cheetsLengthRef}
							/>
						) : null}
					</Fragment>
				)}
			</Box>
		</Layout>
	);
};

export default Homepage;
