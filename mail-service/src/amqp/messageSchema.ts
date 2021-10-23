import * as yup from "yup";

export const messageTypes = ["forgetPassword"];

export const messageSchema = yup.object().shape({
	to: yup.string().email().required(),
	subject: yup.string().required(),
	type: yup.string().required().oneOf(["forget_password"]),
	context: yup.object().optional().default(undefined),
});
