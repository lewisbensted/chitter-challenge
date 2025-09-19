import React, { Fragment, useState } from "react";
import { Box, CircularProgress, IconButton } from "@mui/material";
import { PersonAddAlt1, PersonRemove } from "@mui/icons-material";
import type { UserEnhanced } from "../interfaces/interfaces";
import toggleFollow from "../utils/toggleFollow";

interface Props {
	isFollowing: boolean | null;
	userEnhanced: UserEnhanced;
	onSuccess: (arg: UserEnhanced) => void;
}

const FollowIcon: React.FC<Props> = ({ isFollowing, userEnhanced, onSuccess }) => {
	const [isLoading, setLoading] = useState<boolean>(false);

	const handleToggle = async () => {
		setLoading(true);
		try {
			const toggledUser = await toggleFollow(userEnhanced);
			if (!toggledUser) return;
			onSuccess(toggledUser);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box>
			{isLoading ? (
				<CircularProgress size="1.3rem" thickness={6} />
			) : (
				<IconButton onClick={handleToggle}>{isFollowing ? <PersonRemove /> : <PersonAddAlt1 />}</IconButton>
			)}
		</Box>
	);
};

export default FollowIcon;
