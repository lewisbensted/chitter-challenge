import React, { Fragment, useEffect, useRef, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ICheet, IConversation } from "../utils/interfaces";
import Layout from "./Layout";
import ErrorModal from "../components/ErrorModal";
import SubmitCheet from "../components/SendCheet";
import { serverURL } from "../utils/serverURL";
import { handleErrors } from "../utils/handleErrors";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import { Box, Button, Grid2, Typography } from "@mui/material";
import ConversationIcon from "../components/ConversationIcon";
import Cheet from "../components/Cheet";
import FlexBox from "../styles/FlexBox";

const User: React.FC = () => {
	const [userId, setUserId] = useState<string>();
	const [isCheetsLoading, setCheetsLoading] = useState<boolean>(false);
	const [isComponentLoading, setComponentLoading] = useState<boolean>(false);
	const [conversation, setConversation] = useState<IConversation>();
	const [cheets, setCheets] = useState<ICheet[]>([]);
	const [username, setUsername] = useState<string>();
	const [errors, setErrors] = useState<string[]>([]);
	const [cheetsError, setCheetsError] = useState<string>();
	const [reloadMessagesTrigger, toggleReloadMessagesTrigger] = useState<boolean>(false);
	const [isUnreadMessages, setUnreadMessages] = useState<boolean>();
	const [scrollUp, setScrollUp] = useState<boolean>(false);
	const [scrollDown, setScrollDown] = useState<boolean>(false);
	const [page, setPage] = useState<number>(0);
	const [reloadCheetsTrigger, toggleReloadCheetsTrigger] = useState<boolean>(false);

	const divRef = useRef<HTMLDivElement>(null);
	const cursorRef = useRef<string>();
	const cheetsLengthRef = useRef<number>(0);

	const { id } = useParams();
	const navigate = useNavigate();

	const [isValidateLoading, setValidateLoading] = useState<boolean>(true);
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
		if (!id) return;
		const fetchCheets = async () => {
			setCheetsLoading(true);
			try {
				const cursorParam = cursorRef.current ? `cursor=${cursorRef.current}` : "";
				const res = await axios.get<ICheet[]>(`${serverURL}/users/${id}/cheets?${cursorParam}&take=5`, {
					withCredentials: true,
				});
				setCheets((cheets) => {
					const updated = [...cheets, ...res.data];
					cheetsLengthRef.current = updated.length;
					return updated;
				});
				setScrollDown(true);
				if (res.data.length) {
					cursorRef.current = res.data[res.data.length - 1].uuid;
				}
			} catch (error) {
				setCheetsError("An unexpected error occured while loading cheets.");
			} finally {
				setCheetsLoading(false);
			}
		};
		fetchCheets();
	}, [id, page]);

	const hasFetchedCheetsOnce = useRef<boolean>(false);
	useEffect(() => {
		if (!id) return;
		if (!hasFetchedCheetsOnce.current) {
			hasFetchedCheetsOnce.current = true;
			return;
		}
		const fetchCheets = async () => {
			setComponentLoading(true);
			try {
				const res = await axios.get<ICheet[]>(
					`${serverURL}/users/${id}/cheets?take=${cheetsLengthRef.current}`,
					{ withCredentials: true }
				);
				setCheets(res.data);
			} catch (error) {
				handleErrors(error, "loading the cheets", setErrors);
			} finally {
				setComponentLoading(false);
			}
		};
		fetchCheets();
	}, [id, reloadCheetsTrigger]);

	const [isUserLoading, setUserLoading] = useState(true);
	const [isMessagesLoading, setMessagesLoading] = useState(true);
	const hasUserLoaded = useRef(false);

	useEffect(() => {
		const fetchConversation = async () => {
			if (!id) return;
			try {
				const res = await axios.get<{ conversation: IConversation; username: string }>(
					`${serverURL}/conversations/${id}`,
					{ withCredentials: true }
				);
				if (res.data.conversation && userId) {
					setConversation(res.data.conversation);
				}
				if (!hasUserLoaded.current) {
					setUsername(res.data.username);
					hasUserLoaded.current = true;
					setUserLoading(false);
				}
			} catch (error) {
				if (axios.isAxiosError(error) && error.response?.status === 404) {
					navigate("/");
				} else {
					throw error;
				}
			}
		};

		const fetchUnread = async () => {
			if (!userId) return;
			const res = await axios.get<boolean>(`${serverURL}/messages/unread`, { withCredentials: true });
			setUnreadMessages(res.data);
		};

		const loadData = async () => {
			try {
				setComponentLoading(true);
				await fetchConversation();
				await fetchUnread();
			} catch (error: unknown) {
				handleErrors(error, "loading messages", setErrors);
			} finally {
				setComponentLoading(false);
				setMessagesLoading(false);
			}
		};

		loadData();
	}, [id, userId, reloadMessagesTrigger, navigate]);

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
			isPageLoading={isValidateLoading || isUserLoading || isMessagesLoading}
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
				{isValidateLoading || isUserLoading || isMessagesLoading ? (
					<FlexBox>
						<FlexBox>
							<CircularProgress thickness={5} />
						</FlexBox>
					</FlexBox>
				) : (
					<Fragment>
						<Typography variant="h4" display="flex">
							{username}
							{!conversation || userId === id ? null : (
								<ConversationIcon
									userId={userId}
									conversation={conversation}
									isComponentLoading={isComponentLoading || isCheetsLoading}
									setComponentLoading={setComponentLoading}
									setConversations={() => {
										setConversation(conversation);
									}}
									reloadTrigger={reloadMessagesTrigger}
									toggleReloadTrigger={toggleReloadMessagesTrigger}
								/>
							)}
						</Typography>

						{isCheetsLoading ? (
							<FlexBox>
								<FlexBox>
									<CircularProgress thickness={5} />
								</FlexBox>
							</FlexBox>
						) : cheetsError ? (
							cheetsError
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
										toggleReloadTrigger={toggleReloadCheetsTrigger}
									/>
								))}
							</Grid2>
						)}
						<Button
							onClick={() => {
								setPage(page + 1);
							}}
						>
							LOAD MORE
						</Button>
						{userId === id ? (
							<SubmitCheet
								setCheetsError={setCheetsError}
								isDisabled={isComponentLoading || isCheetsLoading}
								setCheets={setCheets}
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

export default User;
