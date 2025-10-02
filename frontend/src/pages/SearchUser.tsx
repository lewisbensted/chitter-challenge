import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, CircularProgress, Grid2, IconButton, TextField, Typography } from "@mui/material";
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

	const { users, searchUsers, isSearchLoading, setUsers, searchError, hasNextPage, setPage, page, newUsers } =
		useSearchUsers();

	const {
		reloadConversationsTrigger,
		toggleConversationsTrigger,
		fetchConversations,
		conversations,
		isConversationsLoading,
		setConversationsLoading,
	} = useFetchConversations();

	const { register, handleSubmit } = useForm<{ searchString: string }>();

	const [selectedConversation, setSelectedConversation] = useState<IConversation | null>(null);

	useEffect(() => {
		setConversationsLoading(false);
	}, [setConversationsLoading]);

	const selectedConversationRef = useRef<IConversation | null>(selectedConversation);
	useEffect(() => {
		selectedConversationRef.current = selectedConversation;
	}, [selectedConversation]);

	useEffect(() => {
		if (!newUsers.length || !userId) return;
		void fetchConversations(
			newUsers.map((user) => user.user.uuid),
			false,
			page === 0 ? false : true
		);
	}, [newUsers, userId, fetchConversations]);

	const isFirstLoad = useRef(true);
	useEffect(() => {
		if (!userId) return;
		if (isFirstLoad.current) {
			isFirstLoad.current = false;
			return;
		}
		void fetchConversations(
			selectedConversationRef.current ? [selectedConversationRef.current.interlocutorId] : undefined,
			true,
			true
		);
	}, [reloadConversationsTrigger, userId, fetchConversations]);

	const usersWithConvos = useMemo(
		() =>
			users.map(({ user, isFollowing }) => ({
				user,
				isFollowing,
				conversation: conversations.get(user.uuid) ?? null,
			})),
		[users, conversations]
	);

	const [activeSearch, setActiveSearch] = useState("");

	const onSubmit: SubmitHandler<{ searchString: string }> = async (data) => {
		setPage(0);
		setActiveSearch(data.searchString);
		await searchUsers(data.searchString);
	};

	useEffect(() => {
		if (!activeSearch || page === 0) return;
		void searchUsers(activeSearch);
	}, [activeSearch, page, searchUsers]);

	const isLoading = isSearchLoading || isConversationsLoading;

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
			{activeSearch && (
				<Fragment>
					<ScrollGrid ref={listRef}>
						{!(isLoading && page === 0) &&
							(usersWithConvos.length ? (
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
										userPage={false}
									/>
								))
							) : searchError ? null : (
								<Typography variant="subtitle1">No users found.</Typography>
							))}
						{isLoading ? (
							<FlexBox>
								<CircularProgress thickness={5} />
							</FlexBox>
						) : null}
					</ScrollGrid>
					{hasNextPage && (
						<Button
							onClick={() => {
								setPage((page) => page + 1);
							}}
							variant="contained"
							sx={{ pointerEvents: isLoading ? "none" : undefined }}
						>
							<Typography variant="button">Load more</Typography>
						</Button>
					)}
					{selectedConversation && (
						<MessageModal
							conversation={selectedConversation}
							isOpen={!!selectedConversation}
							setSelectedConversation={setSelectedConversation}
							toggleConversationsTrigger={toggleConversationsTrigger}
						/>
					)}
				</Fragment>
			)}
		</Box>
	);
};

export default SearchUser;
