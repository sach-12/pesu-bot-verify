import { cors, rateLimiter, userLimiter, auth } from "@/utils/middleware";
import { withSessionRoute } from "@/utils/withSession";
import axios from "axios";

const handler = async (req, res) => {
	// Middleware
	await cors(req, res, ["GET"]);
	if (res.headersSent) return;
	await rateLimiter(req, res);
	if (res.headersSent) return;
	await userLimiter(req, res);
	if (res.headersSent) return;
	await auth(req, res);
	if (res.headersSent) return;

	const token = req.headers.authorization.split(" ")[1];

	const url = "https://discord.com/api/oauth2/token/revoke";
	const headers = {
		"Content-Type": "application/x-www-form-urlencoded",
	};
	const data = new URLSearchParams();
	data.append("token", token);

	try {
		await axios.post(url, data, {
			headers,
			auth: {
				username: process.env.CLIENT_ID,
				password: process.env.CLIENT_SECRET,
			},
		});
	} catch (err) {
		console.log(err);
	}
	req.session.destroy();
	await req.session.save();
	return res.status(200).json({
		message: "Success",
	});
};

export default withSessionRoute(handler);
