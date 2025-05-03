import React, { Fragment, useEffect, useRef, useState } from "react";
import axios from "axios";
import Layout from "./Layout";
import { ICheet } from "../utils/interfaces";
import SubmitCheet from "../components/SendCheet";
import ErrorModal from "../components/ErrorModal";
import { serverURL } from "../utils/serverURL";
import { handleErrors } from "../utils/handleErrors";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import Box from "@mui/material/Box/Box";
import Cheet from "../components/Cheet";
import { Button, Grid2, Typography } from "@mui/material";
import FlexBox from "../styles/FlexBox";

const Homepage: React.FC = () => {
	const [userId, setUserId] = useState<string>();
	const [isCheetsLoading, setCheetsLoading] = useState<boolean>(false);
	const [isComponentLoading, setComponentLoading] = useState<boolean>(false);
	const [cheets, setCheets] = useState<ICheet[]>([]);
	const [errors, setErrors] = useState<string[]>([]);
	const [cheetsError, setCheetsError] = useState<string>();
	const [isUnreadMessages, setUnreadMessages] = useState<boolean>();
	const [scrollUp, setScrollUp] = useState<boolean>(false);
	const [scrollDown, setScrollDown] = useState<boolean>(false);
	const [page, setPage] = useState<number>(0);
	const [reloadCheetsTrigger, toggleReloadTrigger] = useState<boolean>(false);
	const [isMessagesLoading, setMessagesLoading] = useState<boolean>(false);
	const [isValidateLoading, setValidateLoading] = useState<boolean>(true);

	const divRef = useRef<HTMLDivElement>(null);
	const cursorRef = useRef<string>();
	const cheetsLengthRef = useRef<number>(0);

	useEffect(() => {
		const validateUser = async () => {
			try {
				const res = await axios.get<string>(`${serverURL}/validate`, { withCredentials: true });
				setUserId(res.data);
			} catch (error) {
				if (axios.isAxiosError(error) && error.response?.status === 401) {
					setUserId(undefined);
				} else {
					handleErrors(error, "authenticating the user", setErrors);
				}
			} finally {
				setValidateLoading(false);
			}
		};
		validateUser();
	}, []);

	useEffect(() => {
		if (!userId) return;
		const fetchMessages = async () => {
			setMessagesLoading(true);
			try {
				const res = await axios.get<boolean>(`${serverURL}/messages/unread`, { withCredentials: true });
				setUnreadMessages(res.data);
			} catch (error) {
				handleErrors(error, "loading user information", setErrors);
			} finally {
				setMessagesLoading(false);
			}
		};
		fetchMessages();
	}, [userId]);

	useEffect(() => {
		const fetchCheets = async () => {
			setCheetsLoading(true);
			try {
				const cursorParam = cursorRef.current ? `cursor=${cursorRef.current}` : "";
				const res = await axios.get<ICheet[]>(`${serverURL}/cheets?${cursorParam}&take=5`, {
					withCredentials: true,
				});
				const newCheets = res.data
				setCheets((cheets) => {
					const updatedCheets = [...cheets, ...newCheets];
					cheetsLengthRef.current = updatedCheets.length;
					return updatedCheets;
				});
				setScrollDown(true);
				if (newCheets) {
					cursorRef.current = newCheets[newCheets.length - 1].uuid;
				}
			} catch (error) {
				setCheetsError("An unexpected error occured while loading cheets.");
			} finally {
				setCheetsLoading(false);
			}
		};
		fetchCheets();
	}, [page]);

	const hasFetchedCheetsOnce = useRef<boolean>(false);
	useEffect(() => {
		if (!hasFetchedCheetsOnce.current) {
			hasFetchedCheetsOnce.current = true;
			return;
		}
		const fetchCheets = async () => {
			setComponentLoading(true);
			try {
				const res = await axios.get<{cheets:ICheet[]}>(`${serverURL}/cheets?take=${cheetsLengthRef.current}`, {
					withCredentials: true,
				});
				setCheets(res.data.cheets);
			} catch (error) {
				handleErrors(error, "loading the cheets", setErrors);
			} finally {
				setComponentLoading(false);
			}
		};
		fetchCheets();
	}, [reloadCheetsTrigger]);

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
			isPageLoading={isValidateLoading || isMessagesLoading}
			isComponentLoading={isComponentLoading || isCheetsLoading}
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

				{isValidateLoading || isMessagesLoading ? (
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
