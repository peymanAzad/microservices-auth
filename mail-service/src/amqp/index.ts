import { sendEmail } from "../sendEmail";
import { manager } from "./manager";
import { messageSchema } from "./messageSchema";

interface ResultMessage {
	result: boolean;
	errors: { field: string; message: string }[];
}

export const start = async () => {
	const channel = await manager.getChannel();
	const queue = "sendEmail";
	await channel.assertQueue(queue);
	channel.prefetch(5);
	channel.consume(queue, async (msg) => {
		if (msg) {
			try {
				const rawMsg = msg.content.toString();
				const content = await messageSchema.validate(JSON.parse(rawMsg));
				if (content.type === "forget_password") {
					const template = "forgetPassword";
					let context = {};
					const url = process.env.CHANGE_PASSWORD_URL!;
					if (content.context)
						context = {
							...content.context,
							url,
						};
					else context = { url };
					await sendEmail(content.to, content.subject, template, context);
					if (msg.properties.replyTo && msg.properties.correlationId) {
						const result: ResultMessage = { result: true, errors: [] };
						channel.sendToQueue(
							msg.properties.replyTo,
							Buffer.from(JSON.stringify(result)),
							{ correlationId: msg.properties.correlationId }
						);
					}
				}
			} catch (error: any) {
				console.log(error);
				if (msg.properties.replyTo && msg.properties.correlationId) {
					const result: ResultMessage = {
						result: false,
						errors: [{ field: "error", message: error.message }],
					};
					channel.sendToQueue(
						msg.properties.replyTo,
						Buffer.from(JSON.stringify(result)),
						{ correlationId: msg.properties.correlationId }
					);
				}
			}
			setTimeout(() => {
				channel.ack(msg);
				console.log("acknoledged");
			}, 100);
		}
	});
};
