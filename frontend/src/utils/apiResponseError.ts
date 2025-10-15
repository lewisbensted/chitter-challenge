export interface ApiResponseError extends Error {
	status: number;
	type: "ApiResponseError";
	expected: unknown;
	actual: unknown;
}

const getType = (data: unknown): string => {
	if (Array.isArray(data)) return "array";
	else if (typeof data === "boolean") return "boolean";
	else if (typeof data === "string") return "string";
	else if (typeof data === "number") return "number";
	else if (data === null) return "null";
	else if (data === undefined) return "undefined";
	else if (typeof data === "object") return "object";
	else return "else";
};

const getFullType = (data: unknown) => {
	if (typeof data == "object" && data !== null && !Array.isArray(data))
		return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, getType(value)]));
	else return getType(data);
};

export const throwApiError = (expected: unknown, actual: unknown) => {
	const error = new Error("Unexpected API data structure") as ApiResponseError;
	error.status = 200;
	error.type = "ApiResponseError";
	error.expected = expected;
	error.actual = getFullType(actual);
	throw error;
};
