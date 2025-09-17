import React, { useEffect, useRef, useState } from "react";
import { Box, CircularProgress, Grid2, IconButton, TextField, Typography } from "@mui/material";
import { useForm, type SubmitHandler } from "react-hook-form";
import FlexBox from "../styles/FlexBox";
import { Search } from "@mui/icons-material";
import axios from "axios";
import { serverURL } from "../config/config";
import ScrollGrid from "../styles/ScrollGrid";
import type { IConversation, IUser } from "../interfaces/interfaces";
import toast from "react-hot-toast";
import User from "../components/User";
import { useAuth } from "../contexts/AuthContext";
import useFetchConversations from "../hooks/useFetchConversations";

const SearchUser: React.FC = () => {
	const listRef = useRef<HTMLDivElement>(null);

	const { userId } = useAuth();

	const { reloadConversationsTrigger, toggleConversationsTrigger, fetchConversations } = useFetchConversations();

	const { register, handleSubmit } = useForm<{ search: string }>();
	const [isFormLoading, setFormLoading] = useState<boolean>(false);
	const [enrichedUsers, setEnrichedUsers] = useState<
		{ user: IUser; isFollowing: boolean | null; conversation: IConversation | null }[]
	>([]);

	const [selectedConversation, setSelectedConversation] = useState<IConversation | null>(null);

	useEffect(() => {
		if (!selectedConversation) return;
		const refreshConversation = async () => {
			const refreshedConversation = await fetchConversations([selectedConversation.interlocutorId]);
			if (refreshedConversation)
				setEnrichedUsers((enrichedUsers) => enrichedUsers.map((enrichedUser) => {
					const { user, isFollowing, conversation } = enrichedUser;
					return conversation?.interlocutorId === selectedConversation.interlocutorId
						? {
							user,
							isFollowing,
							conversation: refreshedConversation[0],
						}
						: enrichedUser;
				}));
		};
		refreshConversation();
	}, [reloadConversationsTrigger, fetchConversations]);

	const onSubmit: SubmitHandler<{ search: string }> = async (data) => {
		setFormLoading(true);
		try {
			const searchRes = await axios.get<{ user: IUser; isFollowing: boolean | null }[]>(
				`${serverURL}/api/users?search=${data.search}`,
				{ withCredentials: true }
			);
			const enrichedUserMap = new Map<
				string,
				{ user: IUser; isFollowing: boolean | null; conversation: IConversation | null }
			>(
				searchRes.data.map((item) => [
					item.user.uuid,
					{ user: item.user, isFollowing: item.isFollowing ?? null, conversation: null },
				])
			);
			if (userId) {
				const conversations = await fetchConversations(searchRes.data.map((item) => item.user.uuid));
				if (conversations)
					conversations.forEach((convo) => {
						const user = enrichedUserMap.get(convo.interlocutorId);
						if (user) user.conversation = convo;
					});
			}
			setEnrichedUsers(Array.from(enrichedUserMap.values()));
		} catch (error) {
			toast("failed to search for users");
		} finally {
			setFormLoading(false);
		}
	};

	return (
		<Box>
			<Typography variant="h4">Search</Typography>
			<FlexBox>
				<Grid2 container component="form" onSubmit={handleSubmit(onSubmit)}>
					<Grid2 size={2} />
					<Grid2 container size={8}>
						<Grid2 size={12}>
							<Typography variant="subtitle1">Search for a user:</Typography>
						</Grid2>
						<Grid2 size={12}>
							<TextField {...register("search")} type="text" variant="standard" />
						</Grid2>
					</Grid2>
					<Grid2 size={2} container justifyContent="center">
						{isFormLoading ? (
							<Box paddingTop={3}>
								<CircularProgress size="2.1rem" thickness={6} />
							</Box>
						) : (
							<IconButton type="submit">
								<Search fontSize="large" />
							</IconButton>
						)}
					</Grid2>
				</Grid2>
			</FlexBox>
			<ScrollGrid ref={listRef}>
				{enrichedUsers.map((enrichedUser) => {
					const toggleFollow = (isFollowingInput: boolean) => {
						setEnrichedUsers((prev) => {
							const updated = prev.map((record) =>
								record.user.uuid === enrichedUser.user.uuid
									? {
										user: record.user,
										isFollowing: isFollowingInput,
										conversation: record.conversation,
									}
									: record
							);
							return updated;
						});
					};
					return (
						<User
							key={enrichedUser.user.uuid}
							conversation={enrichedUser.conversation}
							sessionUserId={userId}
							user={enrichedUser.user}
							isFollowing={enrichedUser.isFollowing}
							setFollowing={toggleFollow}
							toggleConversationsTrigger={toggleConversationsTrigger}
							selectedConversation={selectedConversation}
							setSelectedConversation={setSelectedConversation}
						/>
					);
				})}

				{/* {isFormLoading && (
						<FlexBox>
							<CircularProgress thickness={5} />
						</FlexBox>
					)} */}
			</ScrollGrid>
		</Box>
	);
};

export default SearchUser;
