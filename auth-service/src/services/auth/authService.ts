import { User } from "../../entities/User";
import { frogetPasswordResponse, registerType, userType } from "./userType";
import { IAuthService } from "./IAuthService";
import { UserRepository } from "../../dataAccess/repositories/userRepo";
import { ChacheRepository } from "src/dataAccess/cache/redisRepo";
import { IHashGenerator } from "./IHashGenerator";
import { IUuidGenerator } from "./IUuidGenerator";

export class AuthService implements IAuthService {
	private readonly userRepo: UserRepository;
	private readonly cacheRepo: ChacheRepository;
	private readonly hashGen: IHashGenerator;
	private readonly uuidGen: IUuidGenerator;
	private static readonly FROGET_PASSWORD_PRIFIX = "forget_password:";

	constructor(
		userRepo: UserRepository,
		cacheRepo: ChacheRepository,
		hashGen: IHashGenerator,
		uuidGen: IUuidGenerator
	) {
		this.userRepo = userRepo;
		this.cacheRepo = cacheRepo;
		this.hashGen = hashGen;
		this.uuidGen = uuidGen;
	}
	async forgetPassword(email: string): Promise<frogetPasswordResponse> {
		const user = await this.userRepo.findOne({
			where: {
				email,
			},
		});
		if (!user) throw new Error("user not found");
		const token = this.uuidGen();
		const key = AuthService.FROGET_PASSWORD_PRIFIX + token;
		const result = await this.cacheRepo.set(key, user.id.toString());
		if (!result) throw new Error("cache not set");
		const subject = "forget your password?";
		return {
			to: user.email,
			subject,
			type: "forget_password",
			context: { token },
		};
	}
	async changePassword(token: string, newPassword: string): Promise<boolean> {
		const key = AuthService.FROGET_PASSWORD_PRIFIX + token;
		const userId = await this.cacheRepo.get(key);
		if (!userId) throw new Error("token not found");
		const user = await this.userRepo.findOne(userId);
		if (!user) throw new Error("user not found");
		if (await this.hashGen.verify(user.password, newPassword))
			throw Error("cannot use pervious password");
		await this.userRepo.update(
			{ id: user.id },
			{ password: await this.hashGen.hash(newPassword) }
		);
		await this.cacheRepo.delete(key);
		return true;
	}
	async increamentTokenVersion(userId: number): Promise<boolean> {
		const result = await this.userRepo.increment(
			{ id: userId },
			"tokenVersion",
			1
		);
		return result.affected ? result.affected > 0 : true;
	}

	getByUsername(username: string): Promise<User | undefined> {
		return this.userRepo.getByUsername(username);
	}

	getById(id: number): Promise<User | undefined> {
		return this.userRepo.findOne(id);
	}

	async register(userInput: registerType): Promise<User> {
		if (
			await this.userRepo.findOne({
				where: { username: userInput.username },
			})
		)
			throw new Error("username already exists");
		if (
			await this.userRepo.findOne({
				where: { email: userInput.email },
			})
		)
			throw new Error("email already exists");

		const user = new User();
		user.username = userInput.username;
		user.email = userInput.email;
		user.password = await this.hashGen.hash(userInput.password);
		user.roles = "00000"; //do some role stuff

		const saved = this.userRepo.save(user);
		return saved;
	}

	async login(userInput: userType): Promise<User | undefined> {
		const user = await this.userRepo.findOne({ username: userInput.username });
		if (user) {
			const verify = await this.hashGen.verify(
				user?.password,
				userInput.password
			);
			return verify ? user : undefined;
		}
		return user;
	}

	static isAuthorized(user: userType, role: string): boolean {
		if (!user.roles) return false;
		if (user.roles.length !== role.length)
			throw Error("roles length is not equal");
		for (let i = role.length - 1; i >= 0; --i) {
			const char = user.roles.charAt(i);
			if (role.charAt(i) !== char && char === "0") return false;
		}
		return true;
	}
}
