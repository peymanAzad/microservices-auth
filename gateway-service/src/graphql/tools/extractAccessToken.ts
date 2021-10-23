import { Request } from "express";

export const extractAccessToken = (req: Request) => {
	const authorization = req.headers["authorization"];
	if (!authorization) return null;
	return authorization.split(" ")[1];
};
