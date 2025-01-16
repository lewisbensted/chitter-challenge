import React, { Fragment, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ICheet, IConversation } from "../utils/interfaces";
import Layout from "./Layout";
import ErrorModal from "../components/ErrorModal";
import SubmitCheet from "../components/SendCheet";
import { serverURL } from "../utils/serverURL";
import { handleErrors } from "../utils/handleErrors";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import { Box, Typography } from "@mui/material";
import ConversationIcon from "../components/ConversationIcon";
import Cheet from "../components/Cheet";
import FlexBox from "../styles/FlexBox";

const User: React.FC = () => {
	const [userId, setUserId] = useState<string>();
	const [isPageLoading, setPageLoading] = useState<boolean>(true);
	const [isCheetsLoading, setCheetsLoading] = useState<boolean>(false);
	const [isComponentLoading, setComponentLoading] = useState<boolean>(false);
	const [conversation, setConversation] = useState<IConversation>();
	const [cheets, setCheets] = useState<ICheet[]>();
	const [username, setUsername] = useState<string>();
	const [errors, setErrors] = useState<string[]>([]);
	const [cheetsError, setCheetsError] = useState<string>();
	const [reloadTrigger, toggleReloadTrigger] = useState<boolean>(false);
	const [isUnreadMessages, setUnreadMessages] = useState<boolean>();

	const { id } = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		axios
			.get(`${serverURL}/validate`, { withCredentials: true })
			.then((res: { data: string }) => {
				setUserId(res.data);
			})
			.catch((error: unknown) => {
				if (axios.isAxiosError(error) && error.response?.status === 401) {
					setUserId(undefined);
				} else {
					handleErrors(error, "authenticating the user", setErrors);
				}
				setPageLoading(false);
			});
	}, []);

	useEffect(() => {
		if (id) {
			void (async () => {
				setCheetsLoading(true);
				await axios
					.get(`${serverURL}/users/${id}/cheets`, { withCredentials: true })
					.then((res: { data: ICheet[] }) => {
						setCheets(res.data);
					})
					.catch(() => {
						setCheetsError("An unexpected error occured while loading cheets.");
					});
				setCheetsLoading(false);
			})();
		}
	}, [id]);

	useEffect(() => {
		if (id){
			void (async () => {
				setComponentLoading(true);
				await axios
					.get(`${serverURL}/conversations/${id}`, { withCredentials: true })
					.then((res: { data: { conversation: IConversation; username: string } }) => {
						setUsername(res.data.username);
						setConversation(res.data.conversation);
					})
					.catch((error: unknown) => {
						if (axios.isAxiosError(error) && error.response?.status === 404) {
							navigate("/");
						} else {
							handleErrors(error, "loading the page", setErrors);
						}
					});
			})();


		}
		void (async () => {
			setComponentLoading(true);
			await axios
				.get(`${serverURL}/conversations/${id}`, { withCredentials: true })
				.then((res: { data: { conversation: IConversation; username: string } }) => {
					setUsername(res.data.username);
					setConversation(res.data.conversation);
				})
				.catch((error: unknown) => {
					if (axios.isAxiosError(error) && error.response?.status === 404) {
						navigate("/");
					} else {
						handleErrors(error, "loading the page", setErrors);
					}
				});
		})();
	}, [userId, reloadTrigger, id, navigate]);

	useEffect(() => {
		if (userId) {
			void (async () => {
				await axios
					.get(`${serverURL}/messages/unread`, { withCredentials: true })
					.then((res: { data: boolean }) => {
						setUnreadMessages(res.data);
					})
					.catch((error: unknown) => {
						handleErrors(error, "loading user information", setErrors);
					});
				setPageLoading(false);
				setComponentLoading(false);
			})();
		} else {
			setComponentLoading(false);
		}
	}, [conversation, userId]);

	return (
		<Layout
			userId={userId}
			setUserId={setUserId}
			isPageLoading={isPageLoading}
			isComponentLoading={isComponentLoading || isCheetsLoading}
			setPageLoading={setPageLoading}
			isUnreadMessages={isUnreadMessages}
		>
			<Box>
				<ErrorModal
					errors={errors}
					closeModal={() => {
						setErrors([]);
					}}
				/>
				{isPageLoading ? (
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
									reloadTrigger={reloadTrigger}
									toggleReloadTrigger={toggleReloadTrigger}
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
							cheets?.map((cheet) => (
								<Cheet
									key={cheet.uuid}
									cheet={cheet}
									userId={userId}
									setCheets={setCheets}
									setErrors={setErrors}
									setComponentLoading={setComponentLoading}
									isComponentLoading={isComponentLoading}
									isModalView={false}
								/>
							))
						)}
						{userId === id ? (
							<SubmitCheet
								setCheetsError={setCheetsError}
								isDisabled={isComponentLoading || isCheetsLoading}
								setCheets={setCheets}
								setErrors={setErrors}
								setComponentLoading={setComponentLoading}
							/>
						) : null}
					</Fragment>
				)}
			</Box>
		</Layout>
	);
};

export default User;
