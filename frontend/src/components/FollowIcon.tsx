import React, { useState } from "react";
import { Box, CircularProgress, IconButton } from "@mui/material";
import { PersonAddAlt1, PersonRemove } from "@mui/icons-material";
import type { UserEnhanced } from "../interfaces/interfaces";
import { toggleFollow } from "../utils/toggleFollow";
import { useError } from "../contexts/ErrorContext";

interface Props {
	userEnhanced: UserEnhanced;
	onSuccess: (arg: UserEnhanced) => void;
}

const FollowIcon: React.FC<Props> = ({ userEnhanced, onSuccess }) => {
	const { handleErrors } = useError();

	const [isLoading, setLoading] = useState<boolean>(false);

	const handleToggle = async () => {
		setLoading(true);
		try {
			const toggledUser = await toggleFollow(userEnhanced);
			onSuccess(toggledUser);
		} catch (error) {
			handleErrors(error, `${userEnhanced.isFollowing ? "unfollow" : "follow"} user`, false);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box>
			{isLoading ? (
				<CircularProgress size="1.3rem" thickness={6} />
			) : (
				<IconButton onClick={handleToggle}>
					{userEnhanced.isFollowing ? <PersonRemove /> : <PersonAddAlt1 />}
				</IconButton>
			)}
		</Box>
	);
};

export default FollowIcon;
