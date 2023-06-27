import { cors, rateLimiter } from "@/utils/middleware";
import { withSessionRoute } from "@/utils/withSession";
import axios from "axios";

const handler = async (req, res) => {
	// Middleware
	await cors(req, res, ["GET"]);
	if (res.headersSent) return;
	await rateLimiter(req, res);
	if (res.headersSent) return;

	const { code } = req.query;

	const url = "https://discord.com/api/oauth2/token";
	const headers = {
		"Content-Type": "application/x-www-form-urlencoded",
	};
	const data = new URLSearchParams();
	data.append("grant_type", "authorization_code");
	data.append("code", code);
	data.append("redirect_uri", process.env.REDIRECT_URI);

	try {
		const response = await axios.post(url, data, {
			headers,
			auth: {
				username: process.env.CLIENT_ID,
				password: process.env.CLIENT_SECRET,
			},
		});
		req.session.token = response.data;
		await req.session.save();
		return res.status(200).json({
			message: "Success",
			data: response.data,
		});
	} catch (err) {
		return res.status(401).json({
			message: "Invalid token",
		});
	}
};

export default withSessionRoute(handler);
