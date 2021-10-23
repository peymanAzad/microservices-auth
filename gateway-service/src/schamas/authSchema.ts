import * as yup from "yup";
import { baseSchema } from "./baseSchema";

const baseUserSchema = yup.object({
	username: yup.string().required(),
	id: yup.number().required(),
	roles: yup.string().required(),
	tokenVersion: yup.number().required(),
	password: yup.string().required(),
});

export const userSchema = baseSchema.shape({
	payload: yup
		.object()
		.shape({
			user: baseUserSchema,
			accessToken: yup.string().required(),
			refreshToken: yup.string().required(),
		})
		.default(undefined)
		.notRequired(),
});

export const meSchema = baseSchema.shape({
	payload: yup
		.object()
		.shape({
			user: baseUserSchema,
		})
		.default(undefined)
		.notRequired(),
});
