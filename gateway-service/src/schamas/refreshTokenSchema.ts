import * as yup from "yup";
import { baseSchema } from "./baseSchema";

export const refreshTokenSchema = baseSchema.shape({
	payload: yup
		.object()
		.shape({
			accessToken: yup.string().required(),
			refreshToken: yup.string().required(),
		})
		.default(undefined)
		.notRequired(),
});
