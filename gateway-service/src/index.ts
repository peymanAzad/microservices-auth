import "dotenv-safe/config";
import "reflect-metadata";
import createApp from "./app";

const main = async () => {
	const port = Number(process.env.PORT) || 4000;
	await createApp(port);
};

main();
