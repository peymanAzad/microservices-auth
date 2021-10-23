import "dotenv-safe/config";
import "reflect-metadata";
import { createConnection } from "typeorm";
import createApp from "./host/app";

const main = async () => {
	const conn = await createConnection();
	await conn.runMigrations();
	await createApp();
};

main();
