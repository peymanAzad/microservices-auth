import { Field, ObjectType } from "type-graphql";
import { BaseResponse } from "./baseResponse";

@ObjectType()
export class BoolResponse extends BaseResponse {
	@Field()
	result: boolean;
}
