import * as yup from "yup";

export const baseMessageSchema = yup.object().shape({
	subject: yup.string().required(),
});

export const userPayloadSchema = baseMessageSchema.shape({
	payload: yup.object({
		username: yup.string().required(),
		password: yup.string().required(),
	}),
});

export const mePayloadSchema = baseMessageSchema.shape({
	payload: yup.object({
		token: yup.string().required(),
	}),
});

export const registerPayloadSchema = baseMessageSchema.shape({
	payload: yup.object({
		username: yup.string().required(),
		password: yup.string().required(),
		email: yup.string().required().email(),
	}),
});

export const refreshTokenSchema = baseMessageSchema.shape({
	payload: yup.object({
		refreshToken: yup.string().required(),
	}),
});

export const revokeTokenSchema = baseMessageSchema.shape({
	payload: yup.object({
		accessToken: yup.string().required(),
	}),
});

export const forgetPasswordSchema = baseMessageSchema.shape({
	payload: yup.object({
		email: yup.string().email().required(),
	}),
});

export const changePasswordSchema = baseMessageSchema.shape({
	payload: yup.object({
		newPassword: yup.string().required().min(5),
		token: yup.string().required(),
	}),
});
