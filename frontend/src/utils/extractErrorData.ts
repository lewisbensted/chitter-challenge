interface APIErrorResponse {
	errors?: unknown;
	code?: unknown;
};

export function extractData(data: unknown): { errors: string[]; code: string | null } {
	let errors: string[] = [];
	let code: string | null = null;

	if (data && typeof data === "object") {
		const d = data as APIErrorResponse;

		if (Array.isArray(d.errors) && d.errors.every((item) => typeof item === "string")) {
			errors = d.errors;
		}
		if (typeof d.code === "string") {
			code = d.code;
		}
	}

	return { errors, code };
}
