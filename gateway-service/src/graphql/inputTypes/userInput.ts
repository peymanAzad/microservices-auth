import { IsEmail, IsNotEmpty, MinLength } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType("userInput")
export class UserInput {
	@Field()
	@MinLength(5, { message: "username should be more than 5 characters" })
	@IsNotEmpty({ message: "username is required" })
	username: string;

	@Field()
	@MinLength(5, { message: "password should be more than 5 characters" })
	@IsNotEmpty({ message: "password is required" })
	password: string;
}

@InputType("registerInput")
export class RegisterInput extends UserInput {
	@Field()
	@IsEmail({}, { message: "email is not valid" })
	@IsNotEmpty({ message: "email is required" })
	email: string;

	@Field()
	@MinLength(5, {
		message: "confirm password should be more than 5 characters",
	})
	@IsNotEmpty({ message: "password is required" })
	confirmPassword: string;
}

@InputType("changePasswordInput")
export class ChangePassword {
	@Field()
	@IsNotEmpty({ message: "token is required" })
	token: string;

	@Field()
	@MinLength(5, { message: "new password should be more than 5 characters" })
	@IsNotEmpty({ message: "new password is required" })
	newPassword: string;

	@Field()
	@MinLength(5, {
		message: "confirm password should be more than 5 characters",
	})
	@IsNotEmpty({ message: "password is required" })
	confirmPassword: string;
}
