import { IAuthService } from "../../services/auth/IAuthService";
import { authenticateRequest, jwtVerifyPromise } from "./authConfig";
import { createRerfreshToken } from "./createRefreshToken";
import { createAccessToken } from "./createAccessToken";

export const revokeToken = async (token: string, authService: IAuthService) => {
	const user = await authenticateRequest(token, authService);
	const result = await authService.increamentTokenVersion(user.id);
	return result;
};

export const refreshToken = async (
	token: string,
	authService: IAuthService
): Promise<{ refreshToken: string; accessToken: string }> => {
	const payload = await jwtVerifyPromise(
		token,
		process.env.REFRESH_TOKEN_SECRET!
	);
	if (!payload) throw Error("payload is undefined");
	if (!payload.userId) throw Error("payload user id is not exist");

	const user = await authService.getById(payload.userId);

	if (!user) {
		throw Error("user not exist");
	}

	if (user.tokenVersion !== payload.tokenVersion) {
		throw Error("token verison violation");
	}

	const refreshToken = await createRerfreshToken(user);
	const accessToken = await createAccessToken(user);

	if (!accessToken) throw Error("empty accessToken after sign");
	if (!refreshToken) throw Error("empty refresh token after sign");

	return {
		refreshToken,
		accessToken,
	};
};
