import { IAuthService } from "../../services/auth/IAuthService";
import { manager } from "./manager";
import { dispatch } from "./dispatch";
import { User } from "../../entities/User";

export interface ResponseMessage {
	result: boolean;
	payload?: { user?: User; accessToken?: string; refreshToken?: string };
	errors: { field: string; message: string }[];
}

// const waitForSecounds = (seconds: number) =>
// 	new Promise<void>((resolve) => {
// 		setTimeout(() => {
// 			resolve();
// 		}, seconds * 1000);
// 	});

export const consume = async (authService: IAuthService) => {
	const channel = await manager.getChannel();
	const queue = "authOps";
	await channel.assertQueue(queue);
	channel.consume(queue, async (msg) => {
		if (msg) {
			const result = await dispatch(msg, authService);
			if (result && msg.properties.replyTo) {
				channel.sendToQueue(
					msg.properties.replyTo,
					Buffer.from(JSON.stringify(result)),
					{ correlationId: msg.properties.correlationId }
				);
			}
			setTimeout(() => {
				channel.ack(msg);
				console.log("acknoledged");
			}, 100);
		}
	});
};
