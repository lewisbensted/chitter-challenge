import React, { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
		setConversations,
		fetchConversations,
		conversations,
		isConversationsLoading,
		setConversationsLoading,
		refreshConversations,
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
		void fetchConversations(newUsers.map((user) => user.user.uuid));
	}, [newUsers, userId, fetchConversations]);

	const usersWithConvos = useMemo(
		() =>
			users.map(({ user, isFollowing }) => ({
				user,
				isFollowing,
				conversation: conversations.get(user.uuid) ?? null,
			})),
		[users, conversations]
	);

	const isLoading = isSearchLoading || isConversationsLoading;

	const [displayedUsers, setDisplayedUsers] = useState<IUserEnhanced[]>([]);
	useEffect(() => {
		if (isLoading) return;
		setDisplayedUsers(usersWithConvos);
	}, [isLoading, usersWithConvos]);

	const [activeSearch, setActiveSearch] = useState<string | null>(null);

	const onSubmit: SubmitHandler<{ searchString: string }> = async (data) => {
		setActiveSearch(data.searchString);
		setPage(0);
		await searchUsers(data.searchString, true);
	};

	useEffect(() => {
		if (!activeSearch || page === 0) return;
		void searchUsers(activeSearch);
	}, [activeSearch, page, searchUsers]);

	useLayoutEffect(() => {
		requestAnimationFrame(() => {
			if (listRef.current) {
				listRef.current.scrollTo({
					top: listRef.current.scrollHeight,
					behavior: "smooth",
				});
			}
		});
	}, [displayedUsers.length]);

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
					width={400}
				>
					<Grid2 container size={11} paddingRight={2}>
						<TextField {...register("searchString")} type="text" variant="standard" label="Username" />
					</Grid2>
					<Grid2 size={1} container justifyContent="center">
						<IconButton type="submit" sx={{ pointerEvents: isSearchLoading ? "none" : undefined }}>
							<Search fontSize="large" />
						</IconButton>
					</Grid2>
				</Grid2>
			</FlexBox>
			{activeSearch !== null && (
				<Fragment>
					<ScrollGrid ref={listRef} height={430}>
						<Fragment>
							{((page === 0 && !isLoading) || page > 0) &&
								displayedUsers.length > 0 &&
								displayedUsers.map((user) => (
									<User
										key={user.user.uuid}
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
								))}
							{page === 0 && !isLoading && !displayedUsers.length && !searchError && (
								<Typography variant="subtitle1">No users found.</Typography>
							)}
						</Fragment>
						{isLoading && (
							<FlexBox>
								<CircularProgress thickness={5} />
							</FlexBox>
						)}
					</ScrollGrid>
					{hasNextPage && (
						<FlexBox>
							<Button
								onClick={() => {
									setPage((page) => page + 1);
								}}
								variant="contained"
								sx={{ pointerEvents: isLoading ? "none" : undefined }}
							>
								<Typography variant="button">Load more</Typography>
							</Button>
						</FlexBox>
					)}
					{selectedConversation && (
						<MessageModal
							conversation={selectedConversation}
							isOpen={!!selectedConversation}
							setSelectedConversation={setSelectedConversation}
							setConversations={setConversations}
							refreshConversations={refreshConversations}
						/>
					)}
				</Fragment>
			)}
		</Box>
	);
};

export default SearchUser;
