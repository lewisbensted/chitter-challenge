import { Request } from "express";

export interface MockRequest extends Request {
	session: Record<string, any>;            
	params: Record<string, any>           
	query: Record<string, any>                       
}

export const createMockReq = () => ({
	session: {},
	query: {},
	params: {},
} as MockRequest );
