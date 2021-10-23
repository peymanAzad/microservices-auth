import { IAuthService } from "../../services/auth/IAuthService";
import { refreshToken, revokeToken } from "../auth/authController";
import { createAccessToken } from "../auth/createAccessToken";
import { createRerfreshToken } from "../auth/createRefreshToken";
import { ResponseMessage } from ".";
import {
	changePasswordSchema,
	forgetPasswordSchema,
	mePayloadSchema,
	refreshTokenSchema,
	revokeTokenSchema,
	userPayloadSchema,
} from "./messageSchema";
import { manager } from "./manager";
import { ConsumeMessage } from "amqplib";
import { authenticateRequest } from "../auth/authConfig";
const EMAIL_SERVICE_QUEUE = "sendEmail";
interface EmailMessgae {
	to: string;
	subject: string;
	body?: string;
	type: string;
	context: any;
}

export const dispatch = async (
	msg: ConsumeMessage,
	authService: IAuthService
): Promise<ResponseMessage | null> => {
	const message = JSON.parse(msg.content.toString());
	switch (message.subject) {
		case "me":
			try {
				const loginMsg = await mePayloadSchema.validate(message);
				const user = await authenticateRequest(
					loginMsg.payload.token,
					authService
				);
				return {
					result: true,
					payload: {
						user,
					},
					errors: [],
				};
			} catch (error: any) {
				console.log(error);
				return {
					result: false,
					errors: [
						{
							field: "token",
							message: "invalid token",
						},
					],
				};
			}
		case "login":
			try {
				const loginMsg = await userPayloadSchema.validate(message);
				const user = await authService.login(loginMsg.payload);
				return user
					? {
							result: true,
							payload: {
								user,
								refreshToken: (await createRerfreshToken(user))!, //we check user existance so totaly imposible to get undefined token
								accessToken: await createAccessToken(user)!,
							},
							errors: [],
					  }
					: {
							result: false,
							errors: [
								{
									field: "error",
									message: "invlid username or password",
								},
							],
					  };
			} catch (error: any) {
				return {
					result: false,
					errors: [{ field: "error", message: error.message }],
				};
			}
		case "register":
			try {
				const registerMsg = await userPayloadSchema.validate(message);
				const user = await authService.register(registerMsg.payload);
				return {
					result: true,
					payload: {
						user,
						accessToken: (await createAccessToken(user))!,
						refreshToken: (await createRerfreshToken(user))!,
					},
					errors: [],
				};
			} catch (error: any) {
				return {
					result: false,
					errors: [{ field: "error", message: error.message }],
				};
			}
		case "refresh_token":
			const refreshMsg = await refreshTokenSchema.validate(message);
			try {
				const tokens = await refreshToken(
					refreshMsg.payload.refreshToken,
					authService
				);
				return {
					result: true,
					payload: {
						refreshToken: tokens.refreshToken,
						accessToken: tokens.accessToken,
					},
					errors: [],
				};
			} catch (error: any) {
				return {
					result: false,
					errors: [{ field: "error", message: error.message }],
				};
			}
		case "revoke_token":
			try {
				const revokeMsg = await revokeTokenSchema.validate(message);
				const result = await revokeToken(
					revokeMsg.payload.accessToken,
					authService
				);
				return {
					result,
					errors: [],
				};
			} catch (error: any) {
				return {
					result: false,
					errors: [{ field: "error", message: error.message }],
				};
			}
		case "forget_password":
			try {
				const forgetPassMsg = await forgetPasswordSchema.validate(message);
				const result: EmailMessgae = await authService.forgetPassword(
					forgetPassMsg.payload.email
				);
				const channel = await manager.getChannel();
				await channel.assertQueue(EMAIL_SERVICE_QUEUE, { durable: true });
				channel.sendToQueue(
					EMAIL_SERVICE_QUEUE,
					Buffer.from(JSON.stringify(result)),
					{
						replyTo: msg.properties.replyTo,
						correlationId: msg.properties.correlationId,
					}
				);
				return null; //mail service responsible for sending response to gateway
			} catch (error: any) {
				if (error.message === "user not found") {
					return {
						result: true,
						errors: [],
					};
				} else if (error.message === "cache not set") {
					console.log(error);
					return {
						result: false,
						errors: [],
					};
				} else {
					return {
						result: false,
						errors: [{ field: "error", message: error.message }],
					};
				}
			}
		case "change_password":
			try {
				const changePassMsg = await changePasswordSchema.validate(message);
				const result = await authService.changePassword(
					changePassMsg.payload.token,
					changePassMsg.payload.newPassword
				);
				return { result, errors: [] };
			} catch (error: any) {
				if (error.message === "user not found") {
					return { result: false, errors: [] };
				} else {
					return {
						result: false,
						errors: [
							{
								field: "error",
								message: error.message,
							},
						],
					};
				}
			}
		default:
			return {
				result: false,
				errors: [{ field: "error", message: "unknown subject" }],
			};
	}
};
