import { cors, rateLimiter, userLimiter, auth } from "@/utils/middleware";
import axios from "axios";

const handler = async (req, res) => {
	// Middleware
	await cors(req, res, ["GET"]);
	if (res.headersSent) return;
	await rateLimiter(req, res);
	if (res.headersSent) return;
	await userLimiter(req, res);
	if (res.headersSent) return;

	let user = await auth(req, res);
	if (res.headersSent) return;
	user.guild_info = {
		in_guild: false,
		is_verified: false,
		is_mod: false,
	};

	const discordApiUrl = `https://discord.com/api/guilds/742797665301168220/members/${user.id}`;
	const discordApiHeaders = {
		"Content-Type": "application/json",
		Authorization: `Bot ${process.env.BOT_TOKEN}`,
	};

	try {
		const response = await axios.get(discordApiUrl, { headers: discordApiHeaders });
		user.guild_info.in_guild = true;
		const verifiedRoleId = "749683320941445250"
		if (response.data.roles.includes(verifiedRoleId)) {
			user.guild_info.is_verified = true;
		}
		const modRoleId = "742798158966292640"
		const adminRoleId = "742800061280550923"
		if (response.data.roles.includes(modRoleId) || response.data.roles.includes(adminRoleId)) {
			user.guild_info.is_mod = true;
		}
	} catch (err) {
		console.log(err);
	}

	return res.status(200).json({
		message: "Success",
		data: user,
	});
};

export default handler;
