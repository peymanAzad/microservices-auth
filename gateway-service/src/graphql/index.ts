import { buildSchema } from "type-graphql";
import { Context } from "./types";
import { Express } from "express";
import { UserResolver } from "./resolvers/userResolver";
import { ApolloServer } from "apollo-server-express";
import cookieParser from "cookie-parser";

const api = async (app: Express) => {
	app.use(cookieParser());

	const schema = await buildSchema({
		resolvers: [UserResolver],
		validate: false,
	});

	const server = new ApolloServer({
		schema,
		context: ({ req, res }): Context => ({
			request: req,
			response: res,
		}),
	});
	await server.start();
	server.applyMiddleware({ app, cors: false });

	return app;
};
export default api;
