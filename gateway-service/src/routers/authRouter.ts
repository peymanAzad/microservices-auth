import express from "express";
import { sendMessage } from "../amqp/auth";
import { baseSchema } from "../schamas/baseSchema";
import { refreshTokenSchema } from "../schamas/refreshTokenSchema";
import { extractAccessToken } from "../graphql/tools/extractAccessToken";
import { sendRefreshToken } from "../graphql/tools/refreshToken";

export const cookieName = process.env.REFRESH_TOKEN_COOKIE_NAME || "jid";

const router = express.Router();

router.post("/revoke_refresh_token", async (req, res) => {
	try {
		const token = extractAccessToken(req);
		if (!token) return res.sendStatus(401);

		const rawMsg = await sendMessage({
			subject: "revoke_token",
			payload: {
				accessToken: token,
			},
		});
		const content = await baseSchema.validate(JSON.parse(rawMsg));
		if (content.result) {
			res.clearCookie(cookieName);
			return res.sendStatus(200);
		} else {
			return res.send(content.errors);
		}
	} catch (err) {
		console.log(err);
		return res.sendStatus(500);
	}
});

router.post("/refresh_token", async (req, res) => {
	try {
		const token = req.cookies[cookieName];
		if (!token) {
			return res.status(400).send({ ok: false, accessToken: "" });
		}

		const refreshToken = req.cookies[cookieName];

		const rawMsg = await sendMessage({
			subject: "refresh_token",
			payload: {
				refreshToken,
			},
		});
		const content = await refreshTokenSchema.validate(JSON.parse(rawMsg));

		if (content.result) {
			sendRefreshToken(res, content.payload.refreshToken);
			return res
				.status(200)
				.send({ ok: true, accessToken: content.payload.accessToken });
		} else {
			return res.send({ ok: false, errors: content.errors, accessToken: "" });
		}
	} catch (err) {
		console.log(err);
		return res.send({ ok: false, accessToken: "" });
	}
});

export default router;
