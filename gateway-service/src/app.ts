import express from "express";
import graphqlApi from "./graphql";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routers/authRouter";

const createApp = async (port: number) => {
	const app = express();

	const corsHost = process.env.CORS_CLIENT_HOST;
	if (corsHost) {
		app.use(
			cors({
				origin: corsHost,
				credentials: true,
			})
		);
	}
	app.use(cookieParser());

	await graphqlApi(app);
	app.use(authRouter);

	app.listen(port, () => {
		console.log("server listens on ", port);
	});

	return app;
};
export default createApp;
