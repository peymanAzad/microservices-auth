import {
	Arg,
	Ctx,
	//Ctx,
	Mutation,
	Query,
	Resolver,
} from "type-graphql";
import { UserResponse } from "../outputTypes/userResponse";
//import { Context } from "../types";
import { User } from "../outputTypes/User";
import {
	ChangePassword,
	RegisterInput,
	UserInput,
} from "../inputTypes/userInput";
import { validateInput } from "../tools/validator";
import { sendMessage } from "../../amqp/auth";
import { meSchema, userSchema } from "../../schamas/authSchema";
import { Context } from "../types";
import { cookieName, sendRefreshToken } from "../tools/refreshToken";
import validator from "validator";
import { BoolResponse } from "../outputTypes/boolResponse";
import { baseSchema } from "../../schamas/baseSchema";
import { extractAccessToken } from "../tools/extractAccessToken";

@Resolver(User)
export class UserResolver {
	@Query(() => UserResponse)
	async me(@Ctx() { request }: Context): Promise<UserResponse> {
		const token = extractAccessToken(request);
		if (!token)
			return {
				errors: [
					{
						field: "token",
						message: "unauthorized",
					},
				],
			};
		try {
			const rawMsg = await sendMessage({
				subject: "me",
				payload: {
					token,
				},
			});
			const content = await meSchema.validate(rawMsg);
			if (!content.result) {
				return {
					errors: content.errors,
				};
			}
			return {
				user: content.payload.user,
			};
		} catch (error: any) {
			console.log(error);
			return {
				errors: [{ field: "error", message: "internal server error" }],
			};
		}
	}

	@Mutation(() => UserResponse)
	async register(
		@Arg("registerInput", () => RegisterInput!) registerInput: RegisterInput,
		@Ctx() context: Context
	): Promise<UserResponse> {
		const errors = await validateInput(registerInput);
		if (registerInput.password !== registerInput.confirmPassword) {
			errors.push({
				field: "confirmPassword",
				message: "confirm passowrd does not match",
			});
		}
		if (errors.length > 0) {
			return {
				errors,
			};
		}
		try {
			const response = await sendMessage({
				subject: "register",
				payload: registerInput,
			});
			const message = await userSchema.validate(JSON.parse(response));
			if (message.result) {
				await sendRefreshToken(
					context.response,
					message.payload.refreshToken as string
				);
				return {
					user: message.payload.user,
					access_token: message.payload.accessToken,
				};
			} else {
				return {
					errors: message.errors,
				};
			}
		} catch (error: any) {
			return {
				errors: [{ field: "error", message: error.message }],
			};
		}
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg("userInput", () => UserInput!) userInput: UserInput,
		@Ctx() context: Context
	): Promise<UserResponse> {
		const errors = await validateInput(userInput);
		if (errors.length > 0) {
			return {
				errors,
			};
		}
		const response = await sendMessage({
			subject: "login",
			payload: userInput,
		});
		const message = await userSchema.validate(JSON.parse(response));
		if (message.result) {
			sendRefreshToken(context.response, message.payload.refreshToken);
			return {
				user: message.payload.user,
				access_token: message.payload.accessToken,
			};
		}
		return {
			errors: message.errors,
		};
	}

	@Mutation(() => BoolResponse)
	async forgetPassword(@Arg("email") email: string): Promise<BoolResponse> {
		const valid = validator.isEmail(email);
		if (!valid) {
			return {
				result: false,
				errors: [
					{
						field: "email",
						message: "invalid email address",
					},
				],
			};
		}
		const message = await sendMessage({
			subject: "forget_password",
			payload: {
				email,
			},
		});
		const response = await baseSchema.validate(JSON.parse(message));
		return {
			result: response.result,
			errors: response.errors,
		};
	}

	@Mutation(() => BoolResponse)
	async changePassword(
		@Arg("changePasswordInput")
		{ token, newPassword, confirmPassword }: ChangePassword
	): Promise<BoolResponse> {
		if (newPassword !== confirmPassword) {
			return {
				result: false,
				errors: [
					{
						field: "confirmPassword",
						message: "confirm password not match password",
					},
				],
			};
		}
		const message = await sendMessage({
			subject: "change_password",
			payload: {
				newPassword,
				token,
			},
		});
		const response = await baseSchema.validate(message);
		return {
			result: response.result,
			errors: response.errors,
		};
	}

	@Mutation(() => Boolean)
	async logout(@Ctx() { response }: Context): Promise<boolean> {
		response.clearCookie(cookieName);
		return true;
	}

	@Mutation(() => BoolResponse)
	async revokeRefreshTokens(
		@Ctx() { request, response }: Context
	): Promise<BoolResponse> {
		try {
			const token = extractAccessToken(request);
			if (!token)
				return {
					result: false,
					errors: [
						{
							field: "token",
							message: "not authorized",
						},
					],
				};

			const rawMsg = await sendMessage({
				subject: "revoke_token",
				payload: {
					accessToken: token,
				},
			});
			const content = await baseSchema.validate(JSON.parse(rawMsg));
			if (content.result) {
				response.clearCookie(cookieName);
				return {
					result: true,
				};
			} else {
				return {
					result: false,
					errors: content.errors,
				};
			}
		} catch (err) {
			console.log(err);
			return {
				result: false,
				errors: [
					{
						field: "error",
						message: "internal server error",
					},
				],
			};
		}
	}
}
