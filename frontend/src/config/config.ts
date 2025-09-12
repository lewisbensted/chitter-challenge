export const serverURL =
	process.env.NODE_ENV === "prod" ? "" : `http://localhost:${import.meta.env.VITE_SERVER_PORT ?? ""}`;
