import { IAuthService } from "../../services/auth/IAuthService";
import jwt from "jsonwebtoken";

export const jwtVerifyPromise = (
	token: string,
	secret: string,
	options?: jwt.VerifyOptions
) =>
	new Promise<jwt.JwtPayload | undefined>((res, rej) => {
		jwt.verify(token, secret, options, (err, payload) => {
			if (err) rej(err);
			else res(payload);
		});
	});

export const jwtSignPromise = (
	payload: Object,
	secret: string,
	options: jwt.SignOptions
) =>
	new Promise<string | undefined>((res, rej) => {
		if (payload) {
			jwt.sign(payload, secret, options, (err, token) => {
				if (err) {
					rej(err);
				}
				res(token);
			});
		} else rej("invalid payload");
	});

export const authenticateRequest = async (
	token: string,
	authService: IAuthService
) => {
	const payload = await jwtVerifyPromise(
		token,
		process.env.ACCESS_TOKEN_SECRET!
	);
	if (!payload) throw Error("authenticate request: empty payload after verify");
	const user = await authService.getById(payload.userId);
	if (!user) throw Error("authenticate request: user not found");
	return user;
};
