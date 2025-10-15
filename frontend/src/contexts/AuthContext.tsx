import React, { useEffect } from "react";
import { createContext, type ReactNode, useCallback, useContext, useState } from "react";
import { serverURL } from "../config/config";
import axios from "axios";
import { useError } from "./ErrorContext";
import { throwApiError } from "../utils/apiResponseError";

interface AuthContextType {
	userId: string | null | undefined;
	isValidateLoading: boolean;
	setValidateLoading: React.Dispatch<React.SetStateAction<boolean>>;
	validateUser: () => Promise<void>;
	setUserId: React.Dispatch<React.SetStateAction<string | null | undefined>>;
	isLoggingOut: boolean;
	setLoggingOut: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [userId, setUserId] = useState<string | null>();
	const [isValidateLoading, setValidateLoading] = useState(true);
	const [isLoggingOut, setLoggingOut] = useState<boolean>(false);

	const { handleErrors } = useError();

	const validateUser = useCallback(async () => {
		try {
			setValidateLoading(true);
			const res = await axios.get<string>(`${serverURL}/api/validate`, { withCredentials: true });
			const userId = res.data;
			if (typeof userId !== "string") throwApiError("string", userId);
			setUserId(userId);
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 401) {
				setUserId(null);
			} else {
				handleErrors(error, "fetching page information");
			}
		} finally {
			setValidateLoading(false);
		}
	}, [handleErrors]);

	useEffect(() => {
		void validateUser();
	}, [validateUser]);

	return (
		<AuthContext.Provider
			value={{
				userId,
				isValidateLoading,
				validateUser,
				setUserId,
				setValidateLoading,
				isLoggingOut,
				setLoggingOut,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider.");
	}
	return context;
};
