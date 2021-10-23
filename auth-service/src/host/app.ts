import { UserRepository } from "../dataAccess/repositories/userRepo";
import { getConnection } from "typeorm";
import { AuthService } from "../services/auth/authService";
import { consume } from "./amqp";
import Redis from "ioredis";
import { ChacheRepository } from "../dataAccess/cache/redisRepo";
import argon from "argon2";
import { v4 } from "uuid";

const createApp = async () => {
	const userRepository = getConnection().getCustomRepository(UserRepository);
	const redis = new Redis(process.env.REDISS_CONNECTION);
	const cacheRepo = new ChacheRepository(redis);
	const authService = new AuthService(userRepository, cacheRepo, argon, v4);
	consume(authService);
};
export default createApp;
