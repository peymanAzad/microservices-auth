import amqp from "amqplib";

class amqpManager {
	private channel: amqp.Channel | null;
	private conn: amqp.Connection | null;
	private async initConn() {
		this.conn = await amqp.connect(
			process.env.AMQP_COONECTION || "amqp://localhost"
		);
		this.conn.on("error", (err: any) => {
			this.channel = null;
			throw Error(err.message);
		});
		this.conn.on("close", () => {
			this.channel = null;
			this.conn = null;
		});
	}
	private async initChannel() {
		if (!this.conn) throw Error("initChannel: connection is not initiated");
		this.channel = await this.conn.createChannel();
		this.channel.on("close", () => {
			this.channel = null;
		});
		this.channel.on("error", () => {
			this.channel = null;
		});
	}
	async getChannel() {
		if (!this.conn) {
			await this.initConn();
		}
		if (!this.channel) {
			await this.initChannel();
		}
		if (!this.conn || !this.channel)
			throw Error("getChannel: invalid connection or channel initiation");
		return this.channel;
	}
}

export const manager = new amqpManager();
