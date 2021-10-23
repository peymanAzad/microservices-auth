import { Response } from "express";

export const cookieName = process.env.REFRESH_TOKEN_COOKIE_NAME || "jid";
export const sendRefreshToken = (res: Response, token: string) => {
	res.cookie(cookieName, token, {
		httpOnly: true,
	});
};
