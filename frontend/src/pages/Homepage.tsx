import React, { Fragment, useEffect, useState } from "react";
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
import { Typography } from "@mui/material";
import FlexBox from "../styles/FlexBox";

const Homepage: React.FC = () => {
	const [userId, setUserId] = useState<string>();
	const [isPageLoading, setPageLoading] = useState<boolean>(true);
	const [isCheetsLoading, setCheetsLoading] = useState<boolean>(false);
	const [isComponentLoading, setComponentLoading] = useState<boolean>(false);
	const [cheets, setCheets] = useState<ICheet[]>();
	const [errors, setErrors] = useState<string[]>([]);
	const [cheetsError, setCheetsError] = useState<string>();
	const [isUnreadMessages, setUnreadMessages] = useState<boolean>();

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
			})();
		}
	}, [userId]);

	useEffect(() => {
		void (async () => {
			setCheetsLoading(true);
			await axios
				.get(`${serverURL}/cheets`, { withCredentials: true })
				.then((res: { data: ICheet[] }) => {
					setCheets(res.data);
				})
				.catch(() => {
					setCheetsError("An unexpected error occured while loading cheets.");
				});
			setCheetsLoading(false);
		})();
	}, []);

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
				<Typography variant="h4">Welcome to Chitter</Typography>

				{isPageLoading ? (
					<FlexBox>
						<CircularProgress thickness={5} />
					</FlexBox>
				) : (
					<Fragment>
						{isCheetsLoading ? (
							<FlexBox>
								<CircularProgress thickness={5} />
							</FlexBox>
						) : cheetsError ? (
							<Typography variant="subtitle1">{cheetsError}</Typography>
						) : (
							<Box sx={{ overflowY: "auto", maxHeight: 480 }}>
								{cheets?.map((cheet) => (
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
								))}
							</Box>
						)}

						{userId ? (
							<SubmitCheet
								isDisabled={isComponentLoading || isCheetsLoading}
								setCheets={setCheets}
								setCheetsError={setCheetsError}
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

export default Homepage;
