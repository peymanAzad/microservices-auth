import { User } from "../../entities/User";
import { jwtSignPromise } from "./authConfig";

export const createRerfreshToken = (user: User) => {
	return jwtSignPromise(
		{ userId: user.id, tokenVersion: user.tokenVersion },
		process.env.REFRESH_TOKEN_SECRET!,
		{
			expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
		}
	);
};
