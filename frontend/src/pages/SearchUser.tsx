import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, CircularProgress, Grid2, IconButton, TextField, Typography } from "@mui/material";
import { useForm, type SubmitHandler } from "react-hook-form";
import FlexBox from "../styles/FlexBox";
import { Search } from "@mui/icons-material";
import ScrollGrid from "../styles/ScrollGrid";
import type { IConversation, UserEnhanced } from "../interfaces/interfaces";
import User from "../components/User";
import { useAuth } from "../contexts/AuthContext";
import useFetchConversations from "../hooks/useFetchConversations";
import MessageModal from "../components/MessageModal";
import useSearchUsers from "../hooks/useSearchUsers";

const SearchUser: React.FC = () => {
	const listRef = useRef<HTMLDivElement>(null);

	const { userId } = useAuth();

	const { users, searchUsers, isSearchLoading, setUsers } = useSearchUsers();

	const {
		reloadConversationsTrigger,
		toggleConversationsTrigger,
		fetchConversations,
		conversations,
		setConversations,
	} = useFetchConversations();

	const { register, handleSubmit } = useForm<{ searchString: string }>();

	const [selectedConversation, setSelectedConversation] = useState<IConversation | null>(null);

	useEffect(() => {
		if (!selectedConversation) return;
		const refreshConversations = async () => {
			const newConvos = new Map(conversations);
			const refreshedConversation = await fetchConversations([selectedConversation.interlocutorId]);
			if (refreshedConversation) newConvos.set(selectedConversation.interlocutorId, refreshedConversation[0]);
			setConversations(newConvos);
		};
		void refreshConversations();
	}, [reloadConversationsTrigger, fetchConversations]);

	useEffect(() => {
		if (!users.length || !userId) return;
		const fetchConvos = async () => {
			await fetchConversations(users.map((user) => user.user.uuid));
		};
		void fetchConvos();
	}, [users]);

	const usersWithConvos = useMemo(() => {
		return users.map(({ user, isFollowing }) => ({
			user,
			isFollowing,
			conversation: conversations.get(user.uuid) ?? null,
		}));
	}, [users, conversations]);

	const onSubmit: SubmitHandler<{ searchString: string }> = async (data) => {
		await searchUsers(data.searchString);
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
							<TextField {...register("searchString")} type="text" variant="standard" />
						</Grid2>
					</Grid2>
					<Grid2 size={2} container justifyContent="center">
						{isSearchLoading ? (
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
				{usersWithConvos.map((user) => (
					<User
						key={user.user.uuid}
						conversation={user.conversation}
						sessionUserId={userId}
						userEnhanced={user}
						setSelectedConversation={setSelectedConversation}
						onToggleFollow={(arg: UserEnhanced) => {
							setUsers((users) => users.map((user) => (user.user.uuid == arg.user.uuid ? arg : user)));
						}}
					/>
				))}

				{/* {isFormLoading && (
						<FlexBox>
							<CircularProgress thickness={5} />
						</FlexBox>
					)} */}
			</ScrollGrid>
			{selectedConversation && (
				<MessageModal
					conversation={selectedConversation}
					isOpen={!!selectedConversation}
					setSelectedConversation={setSelectedConversation}
					toggleConversationsTrigger={toggleConversationsTrigger}
				/>
			)}
		</Box>
	);
};

export default SearchUser;
