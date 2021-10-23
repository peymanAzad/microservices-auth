export type userType = {
	username: string;
	password: string;
	roles?: string;
};

export type registerType = {
	username: string;
	password: string;
	email: string;
};

export type frogetPasswordResponse = {
	to: string;
	subject: string;
	type: "forget_password";
	context: {
		token: string;
	};
};
