import * as yup from "yup";

export const baseSchema = yup.object().shape({
	result: yup.boolean().required(),
	errors: yup
		.array()
		.required()
		.of(
			yup.object().shape({
				field: yup.string().required(),
				message: yup.string().required(),
			})
		),
});
