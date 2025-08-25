import React, { useCallback } from "react";
import { createContext, ReactNode, useContext, useState } from "react";
import { processErrors } from "../utils/processErrors";

interface ErrorContextType {
	errors: string[];
	setErrors: React.Dispatch<React.SetStateAction<string[]>>;
	clearErrors: () => void;
	handleErrors: (errors: unknown, action: string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider = ({ children }: { children: ReactNode }) => {
	const [errors, setErrors] = useState<string[]>([]);

	const clearErrors = () => {
		setErrors([]);
	};

	const handleErrors = useCallback((error: unknown, action: string) => {
		const errors = processErrors(error, action);
		setErrors(errors);
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
