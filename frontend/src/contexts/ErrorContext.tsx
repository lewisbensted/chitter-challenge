import React, { useCallback } from "react";
import { createContext, type ReactNode, useContext, useState } from "react";
import { logErrors, processErrors } from "../utils/processErrors";
import toast from "react-hot-toast";

interface ErrorContextType {
	errors: string[];
	setErrors: React.Dispatch<React.SetStateAction<string[]>>;
	clearErrors: () => void;
	handleErrors: (errors: unknown, action: string, useModal?: boolean) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider = ({ children }: { children: ReactNode }) => {
	const [errors, setErrors] = useState<string[]>([]);

	const clearErrors = () => {
		setErrors([]);
	};

	const handleErrors = useCallback((error: unknown, action: string, useModal = true) => {
		logErrors(error);
		if (useModal) {
			const errors = processErrors(error, action);
			setErrors(errors);
		} else {
			toast(`Failed to ${action}.`);
		}
	}, []);

	return (
		<ErrorContext.Provider
			value={{
				errors,
				setErrors,
				clearErrors,
				handleErrors,
			}}
		>
			{children}
		</ErrorContext.Provider>
	);
};

export const useError = () => {
	const context = useContext(ErrorContext);
	if (!context) {
		throw new Error("useError must be used within an ErrorProvider.");
	}
	return context;
};
