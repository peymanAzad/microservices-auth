import { Request, Response } from "express";

export type Context = {
	request: Request;
	response: Response;
};
