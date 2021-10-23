import { Redis } from "ioredis";

export class ChacheRepository {
	redis: Redis;
	constructor(redis: Redis) {
		this.redis = redis;
	}
	get(key: string) {
		return this.redis.get(key);
	}
	async set(key: string, value: string, expirySec?: number): Promise<boolean> {
		const result = await this.redis.set(key, value);
		if (result === "OK") {
			if (expirySec) {
				const expResult = await this.redis.expire(key, expirySec);
				return expResult === 1;
			}
			return true;
		}
		return false;
	}
	async delete(key: string) {
		const effected = await this.redis.del(key);
		return effected > 0;
	}
}
