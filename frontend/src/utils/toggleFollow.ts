import type { UserEnhanced } from "../interfaces/interfaces";
import axios from "axios";
import { serverURL } from "../config/config";

const toggleFollow = async (userToFollow: UserEnhanced) => {
	const { user, isFollowing } = userToFollow;
	try {
		//setFollowLoading(true);
		await (isFollowing
			? axios.delete(`${serverURL}/api/follow/${user.uuid}`, { withCredentials: true })
			: axios.post(`${serverURL}/api/follow/${user.uuid}`, {}, { withCredentials: true }));
		//setUserEnhanced((prev) => (prev ? { ...prev, isFollowing: !isFollowing } : prev));
		return { ...userToFollow, isFollowing: !isFollowing };
	} catch (error) {
		console.error(error);
		//handleErrors(error, isFollowing ? "unfollowing" : "following");
	} finally {
		//setFollowLoading(false);
	}
};

export default toggleFollow;
