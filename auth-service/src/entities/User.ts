import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ unique: true })
	username!: string;

	@Column({ unique: true })
	email: string;

	@Column()
	password!: string;
	@Column()
	roles: string;

	@Column("int", { default: 0 })
	tokenVersion: number;
}
