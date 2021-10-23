import { User } from "../../entities/User";
import { frogetPasswordResponse, userType } from "./userType";

export interface IAuthService {
	register(userInput: userType): Promise<User>;
	login(userInput: userType): Promise<User | undefined>;
	getById(id: number | string): Promise<User | undefined>;
	getByUsername(username: string): Promise<User | undefined>;
	increamentTokenVersion(userId: number): Promise<boolean>;
	forgetPassword(email: string): Promise<frogetPasswordResponse>;
	changePassword(token: string, newPassword: string): Promise<boolean>;
}
