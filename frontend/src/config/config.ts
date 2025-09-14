export const serverURL =
	import.meta.env.MODE === "production" ? "" : `http://localhost:${import.meta.env.VITE_SERVER_PORT ?? ""}`;
