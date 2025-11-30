export interface MockRequest {
	sessionID: string;
	session: Record<string, unknown>;
	params: Record<string, unknown>;
	query: Record<string, unknown>;
	body?: Record<string, unknown>;
	cookies?: Record<string, unknown>;
}

export const createMockReq = (): MockRequest => ({
	sessionID: "mocksessionid",
	session: {},
	query: {},
	params: {},
});
