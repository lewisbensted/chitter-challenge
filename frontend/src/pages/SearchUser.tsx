import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, CircularProgress, Grid2, IconButton, TextField, Typography } from "@mui/material";
import { useForm, type SubmitHandler } from "react-hook-form";
import FlexBox from "../styles/FlexBox";
import { Search } from "@mui/icons-material";
import ScrollGrid from "../styles/ScrollGrid";
import type { IConversation, IUserEnhanced } from "../interfaces/interfaces";
import User from "../components/User";
import { useAuth } from "../contexts/AuthContext";
import useFetchConversations from "../hooks/useFetchConversations";
import MessageModal from "../components/MessageModal";
import useSearchUsers from "../hooks/useSearchUsers";

const SearchUser: React.FC = () => {
	const listRef = useRef<HTMLDivElement>(null);

	const { userId } = useAuth();

	const { users, searchUsers, isSearchLoading, setUsers, displayEmpty } = useSearchUsers();

	const {
		reloadConversationsTrigger,
		toggleConversationsTrigger,
		fetchConversations,
		conversations,
		setConversations,
		isConversationsLoading,
		setConversationsLoading,
	} = useFetchConversations();

	const { register, handleSubmit } = useForm<{ searchString: string }>();

	const [selectedConversation, setSelectedConversation] = useState<IConversation | null>(null);

	useEffect(() => {
		setConversationsLoading(false);
	}, [setConversationsLoading]);

	useEffect(() => {
		if (!users.length) return;
		const fetchConvos = async () => {
			await fetchConversations(
				false,
				users.map((user) => user.user.uuid)
			);
		};
		void fetchConvos();
	}, [users, fetchConversations]);

	const selectedConversationRef = useRef<IConversation | null>(selectedConversation);
	const conversationsRef = useRef<Map<string, IConversation>>(conversations);
	useEffect(() => {
		selectedConversationRef.current = selectedConversation;
		conversationsRef.current = conversations;
	}, [conversations, selectedConversation]);

	useEffect(() => {
		const selectedConvo = selectedConversationRef.current;
		if (!selectedConvo) return;
		const refreshConversations = async () => {
			const newConvos = new Map(conversationsRef.current);
			const refreshedConversation = await fetchConversations(true, [selectedConvo.interlocutorId]);
			if (refreshedConversation) newConvos.set(selectedConvo.interlocutorId, refreshedConversation[0]);
			setConversations(newConvos);
		};
		void refreshConversations();
	}, [reloadConversationsTrigger, fetchConversations, setConversations]);

	const usersWithConvos = useMemo(
		() =>
			users.map(({ user, isFollowing }) => ({
				user,
				isFollowing,
				conversation: conversations.get(user.uuid) ?? null,
			})),
		[users, conversations]
	);

	const onSubmit: SubmitHandler<{ searchString: string }> = async (data) => {
		await searchUsers(data.searchString);
	};

	return (
		<Box>
			<Typography variant="h4">Search Users</Typography>
			<FlexBox>
				<Grid2
					container
					component="form"
					onSubmit={handleSubmit(onSubmit)}
					display={"flex"}
					justifyContent={"center"}
				>
					<Grid2 container size={8}>
						<Grid2 size={12} paddingRight={2}>
							<TextField {...register("searchString")} type="text" variant="standard" label="Username" />
						</Grid2>
					</Grid2>
					<Grid2 size={2} container justifyContent="center">
						<IconButton type="submit" sx={{ pointerEvents: isSearchLoading ? "none" : undefined }}>
							<Search fontSize="large" />
						</IconButton>
					</Grid2>
				</Grid2>
			</FlexBox>
			<ScrollGrid ref={listRef}>
				{isSearchLoading || isConversationsLoading ? (
					<FlexBox>
						<CircularProgress thickness={5} />
					</FlexBox>
				) : usersWithConvos.length ? (
					usersWithConvos.map((user) => (
						<User
							key={user.user.uuid}
							conversation={user.conversation}
							sessionUserId={userId}
							userEnhanced={user}
							setSelectedConversation={setSelectedConversation}
							onToggleFollow={(arg: IUserEnhanced) => {
								setUsers((users) =>
									users.map((user) => (user.user.uuid === arg.user.uuid ? arg : user))
								);
							}}
						/>
					))
				) : displayEmpty ? (
					<Typography variant="subtitle1">No users found.</Typography>
				) : null}
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
