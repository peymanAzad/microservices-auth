const fs = require("fs");

const dbpass = fs
	.readFileSync(process.env.DATABASE_PASS_FILE, "utf8")
	.trimEnd();
const url = process.env.DATABASE_URL.replace("$password", dbpass);

module.exports = {
	type: "postgres",
	url,
	synchronize: true,
	logging: true,
	entities: ["dist/entities/**/*.js"],
	migrations: ["dist/dataAccess/migrations/**/*.js"],
};
