import "dotenv-safe/config";
import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import exphbs from "express-handlebars";

const host = process.env.MAIL_SERVER_HOST;
const port = Number(process.env.MAIL_SERVER_PORT);
const user = process.env.AUTH_USERNAME;
const pass = process.env.AUTH_PASSWORD;
const from = process.env.MAIL_FROM;

//attach the plugin to the nodemailer transporter

export const sendEmail = async (
	to: string,
	subject: string,
	template: string,
	context: any
) => {
	// Create a SMTP transporter object
	const transporter = nodemailer.createTransport({
		host,
		port,
		auth: {
			user,
			pass,
		},
	});
	const viewEngine = exphbs.create({ layoutsDir: "mailTemplates" });
	transporter.use(
		"compile",
		hbs({
			viewEngine,
			viewPath: "mailTemplates",
			extName: ".handlebars",
		})
	);

	// Message object
	let message = {
		from,
		to,
		subject,
		template,
		context,
	};

	const info = await transporter.sendMail(message);

	console.log("Message sent: %s", info.messageId);
	// Preview only available when sending through an Ethereal account
	console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

	return info.messageId;
};
