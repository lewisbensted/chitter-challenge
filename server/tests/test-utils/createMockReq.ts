
export interface MockRequest {
	sessionID: string
	session: Record<string, any>;
	params: Record<string, any>;
	query: Record<string, any>;
	body?: Record<string, any>;
	cookies?: Record<string, any>;
}

export const createMockReq = (): MockRequest => ({
	sessionID: 'mocksessionid',
	session: {},
	query: {},
	params: {},
});
