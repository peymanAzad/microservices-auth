import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class User {
	@Field()
	id!: number;

	@Field()
	username!: string;

	password!: string;
	@Field()
	roles: string;

	tokenVersion: number;
}
