import React, { Fragment, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ICheet, IConversation, IUser } from "../interfaces/interfaces";
import Layout from "./Layout";
import ErrorModal from "../components/ErrorModal";
import SubmitCheet from "../components/SendCheet";
import { serverURL } from "../config/config";
import { handleErrors } from "../utils/handleErrors";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import { Box, Button, Grid2, Typography } from "@mui/material";
import ConversationIcon from "../components/ConversationIcon";
import Cheet from "../components/Cheet";
import FlexBox from "../styles/FlexBox";
import validateUser from "../utils/validateUser";
import useValidateUser from "../hooks/useValidateUser";

const User: React.FC = () => {
	const [isCheetsLoading, setCheetsLoading] = useState<boolean>(true);
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
	const [isUserLoading, setUserLoading] = useState(true);
	const [isMessagesLoading, setMessagesLoading] = useState(true);

	const divRef = useRef<HTMLDivElement>(null);
	const cursorRef = useRef<string>();
	const cheetsLengthRef = useRef<number>(0);

	const { id } = useParams();

	const navigate = useNavigate();

	const { userId, isUserValidated, isValidateLoading, setUserId, setValidateLoading, validateUser } =
		useValidateUser();

	useEffect(() => {
		void validateUser((error) => handleErrors(error, "fetching page information", setErrors));
	}, []);

	useEffect(() => {
		if (!id) return;
		const fetchUser = async () => {
			try {
				const res = await axios.get<IUser>(`${serverURL}/user/${id}`, { withCredentials: true });
				setUsername(res.data.username);
			} catch (error) {
				if (axios.isAxiosError(error) && error.response?.status === 404) {
					navigate("/");
				} else {
					handleErrors(error, "fetching page information", setErrors);
				}
			} finally {
				setUserLoading(false);
			}
		};
		void fetchUser();
	}, [id]);

	useEffect(() => {
		if (!id) return;
		const fetchCheets = async () => {
			setCheetsLoading(true);
			try {
				const cursorParam = cursorRef.current ? `cursor=${cursorRef.current}` : "";
				const res = await axios.get<ICheet[]>(`${serverURL}/users/${id}/cheets?${cursorParam}&take=5`, {
					withCredentials: true,
				});
				const newCheets = res.data;
				setCheets((cheets) => {
					const updatedCheets = [...cheets, ...newCheets];
					cheetsLengthRef.current = updatedCheets.length;
					return updatedCheets;
				});
				setCheetsError("");
				setScrollDown(true);
				if (newCheets.length) {
					cursorRef.current = newCheets[newCheets.length - 1].uuid;
				}
			} catch (error) {
				setCheetsError("An unexpected error occured while loading cheets.");
			} finally {
				setCheetsLoading(false);
			}
		};
		void fetchCheets();
	}, [id, page]);

	const hasFetchedCheetsOnce = useRef<boolean>(false);
	const cheetsErrorOnModalClose = useRef<string>();
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
				setCheetsError("");
			} catch (error) {
				handleErrors(error, "reloading cheets", setErrors);
				cheetsErrorOnModalClose.current = "An unexpected error occured while loading cheets.";
			} finally {
				setComponentLoading(false);
			}
		};
		void fetchCheets();
	}, [id, reloadCheetsTrigger]);

	useEffect(() => {
		if (!userId) {
			if (isUserValidated) {
				setMessagesLoading(false);
			}
			return;
		}

		const fetchConversation = async () => {
			if (!id) return;
			const res = await axios.get<IConversation>(`${serverURL}/conversations/${id}`, {
				withCredentials: true,
			});
			setConversation(res.data);
		};

		const fetchUnread = async () => {
			const res = await axios.get<boolean>(`${serverURL}/messages/unread`, { withCredentials: true });
			setUnreadMessages(res.data);
		};

		const loadData = async () => {
			try {
				setComponentLoading(true);
				await Promise.all([fetchConversation(), fetchUnread()]);
			} catch (error) {
				handleErrors(error, "loading messages", setErrors);
			} finally {
				setComponentLoading(false);
				setMessagesLoading(false);
			}
		};

		void loadData();
	}, [id, userId, isUserValidated, reloadMessagesTrigger, navigate]);

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
			isComponentLoading={isComponentLoading || isMessagesLoading}
			setPageLoading={setValidateLoading}
			isUnreadMessages={isUnreadMessages}
		>
			<Box>
				<ErrorModal
					errors={errors}
					closeModal={() => {
						setErrors([]);
						setCheetsError(cheetsErrorOnModalClose.current);
						cheetsErrorOnModalClose.current = undefined;
					}}
				/>
				{isValidateLoading || isUserLoading || isMessagesLoading ? (
					<FlexBox>
						<CircularProgress thickness={5} />
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
