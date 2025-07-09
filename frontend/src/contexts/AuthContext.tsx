import React from "react";
import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { serverURL } from "../config/config";
import axios from "axios";
import { handleErrors, logErrors } from "../utils/handleErrors";

interface AuthContextType {
	userId: string | null | undefined;
	isValidateLoading: boolean;
	setValidateLoading: React.Dispatch<React.SetStateAction<boolean>>;
	validateUser: () => Promise<void>;
	setUserId: React.Dispatch<React.SetStateAction<string | null | undefined>>;
	isComponentLoading: boolean;
	setComponentLoading: React.Dispatch<React.SetStateAction<boolean>>;
	isUnreadMessages: boolean;
	isUnreadLoading: boolean;
	fetchUnread: () => Promise<void>;
	setUnreadLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [userId, setUserId] = useState<string | null>();
	const [isValidateLoading, setValidateLoading] = useState(true);
	const [isComponentLoading, setComponentLoading] = useState(false);
	const [errors, setErrors] = useState<string[]>([]);
	const [isUnreadMessages, setUnreadMessages] = useState<boolean>(false);
	const [isUnreadLoading, setUnreadLoading] = useState<boolean>(false);

	const fetchUnread = useCallback(async () => {
		if (userId === undefined) {
			return;
		} else if (userId === null) {
			setUnreadLoading(false);
			return;
		}
		try {
			setUnreadLoading(true);
			const res = await axios.get<boolean>(`${serverURL}/messages/unread`, { withCredentials: true });

			setUnreadMessages(res.data);
		} catch (error) {
			logErrors(error);
		} finally {
			setUnreadLoading(false);
		}
	}, [userId]);

	const validateUser = useCallback(async () => {
		try {
			setValidateLoading(true);
			const res = await axios.get<string>(`${serverURL}/validate`, { withCredentials: true });
			setUserId(res.data);
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 401) {
				setUserId(null);
			} else {
				handleErrors(error, "fetching page information", setErrors);
			}
		} finally {
			setValidateLoading(false);
		}
	}, []);

	return (
		<AuthContext.Provider
			value={{
				userId,
				isValidateLoading,
				validateUser,
				setUserId,
				isComponentLoading,
				setComponentLoading,
				setValidateLoading,
				isUnreadLoading,
				isUnreadMessages,
				fetchUnread,
				setUnreadLoading,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
