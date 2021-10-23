import * as yup from "yup";

export const loginSchema = yup.object().shape({
	username: yup
		.string()
		.required("username is required")
		.min(5, "username should be at least ${min} characters"),

	password: yup
		.string()
		.required("password is required")
		.min(5, "password should be at least ${min} characters"),
});

export const registerSchema = loginSchema.shape({
	email: yup.string().email().required(),
	confirmPassword: yup
		.string()
		.required("confirm password is required")
		.oneOf(
			[yup.ref("password"), null],
			"confirm password and password must match"
		),
});

export const forgetPasswordSchema = yup.object().shape({
	email: yup.string().email().required(),
});

export const changePasswordSchema = yup.object().shape({
	newPassword: yup
		.string()
		.required("password is required")
		.min(5, "password should be at least ${min} characters"),
	confirmPassword: yup
		.string()
		.required("confirm password is required")
		.oneOf(
			[yup.ref("newPassword"), null],
			"confirm password and password must match"
		),
});
