import { manager } from "../manager";

export interface AuthMessage {
	subject:
		| "login"
		| "register"
		| "refresh_token"
		| "forget_password"
		| "revoke_token"
		| "change_password"
		| "me";
	payload: any;
}
const RESPONSE_QUEUE = "gatewayResponse";

const responseMap = new Map<string, (val: string) => void>();

export const sendMessage = async (message: AuthMessage) => {
	return new Promise<string>(async (resolve, reject) => {
		try {
			const channel = await manager.getChannel();
			const queueName = "authOps";
			await channel.assertQueue(queueName, { durable: true });
			const correlationId = getRadomId();
			channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
				replyTo: RESPONSE_QUEUE,
				correlationId,
			});
			responseMap.set(correlationId, resolve);
		} catch (err) {
			reject(err);
		}
	});
};
const responseMessage = async () => {
	const channel = await manager.getChannel();
	await channel.assertQueue(RESPONSE_QUEUE, { durable: true });
	channel.consume(RESPONSE_QUEUE, (msg) => {
		if (msg) {
			const correlationId = msg?.properties.correlationId;
			if (correlationId) {
				const response = responseMap.get(correlationId);
				if (response) {
					response(msg.content.toString());
					responseMap.delete(correlationId);
				}
			}
			setTimeout(() => {
				channel.ack(msg);
			}, 100);
		}
	});
};
responseMessage();

const getRadomId = () => Math.random().toString();
