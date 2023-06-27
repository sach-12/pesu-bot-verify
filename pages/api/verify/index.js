import { cors, rateLimiter, userLimiter, auth } from "@/utils/middleware";
import connect from "@/utils/db.js";
import verified from "@/utils/models/verified.js";
import batch from "@/utils/models/batchDetails.js";
import axios from "axios";

const handler = async (req, res) => {
	// Middleware
	await cors(req, res, ["POST"]);
	if (res.headersSent) return;
	await rateLimiter(req, res);
	if (res.headersSent) return;
	await userLimiter(req, res);
	if (res.headersSent) return;
	const user = await auth(req, res);
	if (res.headersSent) return;

	const { data } = req.body;

	if (!data) {
		return res.status(400).json({
			message: "Bad Request",
		});
	}

	// Check if user already has verified role
	const roleExistsApiUrl = `https://discord.com/api/guilds/742797665301168220/members/${user.id}`;
	const discordApiHeaders = {
		"Content-Type": "application/json",
		Authorization: `Bot ${process.env.BOT_TOKEN}`,
	};
	try {
		const response = await axios.get(roleExistsApiUrl, { headers: discordApiHeaders });
		const verifiedRoleId = "749683320941445250";
		if (response.data.roles.includes(verifiedRoleId)) {
			return res.status(403).json({
				message: "User already has verified role",
			});
		}
	} catch (err) {
        console.log(`Error in checking if ${user.username} has verified role`)
		console.log(err);
		return res.status(403).json({
			message: "User not in server",
		});
	}

	// Connect to database
	await connect();

	// Check if user's PRN is already verified
	const is_verified = await verified.exists({ PRN: data.PRN });
	if (is_verified) {
		return res.status(403).json({
			message: "PRN already verified with a different user",
		});
	}

	// Check if PRN exists in batch details
	const prn_exists = await batch.exists({ PRN: data.PRN });
	if (!prn_exists) {
		return res.status(404).json({
			message: "Not Found",
		});
	}

	// Check if incoming data matches batch details
	const batch_details = await batch.findOne(data);
	if (!batch_details) {
		return res.status(403).json({
			message: "Section/SRN did not match the PRN",
		});
	}

	// Get the roles to add
	const branch = batch_details.Branch;
	const year = data.PRN.toString().toUpperCase().slice(4, 8);
	const campus = batch_details.Campus.includes("Electronic") ? "EC" : "RR";

    // Get role IDs of the above roles from the server
	const rolesApiUrl = `https://discord.com/api/guilds/742797665301168220/roles`;
    try {
        var rolesApiResponse = await axios.get(rolesApiUrl, { headers: discordApiHeaders });
    } catch (err) {
        console.log(`Error in getting roles from server`)
        console.log(err);
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }

	try {
		var roles = rolesApiResponse.data;
		var branchRoleId = roles.find((role) => role.name === branch).id;
		var yearRoleId = roles.find((role) => role.name === year).id;
		var campusRoleId = roles.find((role) => role.name === campus).id;
	} catch (err) {
		return res.status(500).json({
			message: "Internal Server Error",
		});
	}
	const verifiedRoleId = "749683320941445250";
	const rolesToAdd = [branchRoleId, yearRoleId, campusRoleId, verifiedRoleId];
	const justJoinedRoleId = "798765678739062804";
	const rolesToRemove = [justJoinedRoleId];
    const adminRoleName = roles.find((role) => role.id === "742800061280550923").name;
    const modRoleName = roles.find((role) => role.id === "742798158966292640").name;

	// Add roles to user
	for (const roleId of rolesToAdd) {
		const addRoleApiUrl = `https://discord.com/api/guilds/742797665301168220/members/${user.id}/roles/${roleId}`;
		try {
			await axios.put(addRoleApiUrl, {}, { headers: discordApiHeaders });
			console.log(`Added role ${roles.find((role) => role.id === roleId).name} to user ${user.username}`);
		} catch (err) {
			console.log(`Error adding role ${roles.find((role) => role.id === roleId).name} to user ${user.username}`);
			console.log(err);
		}
	}

	// Remove roles from user
	for (const roleId of rolesToRemove) {
		const removeRoleApiUrl = `https://discord.com/api/guilds/742797665301168220/members/${user.id}/roles/${roleId}`;
		try {
			await axios.delete(removeRoleApiUrl, { headers: discordApiHeaders });
			console.log(`Removed role ${roles.find((role) => role.id === roleId).name} from user ${user.username}`);
		} catch (err) {
			console.log(`Error removing role ${roles.find((role) => role.id === roleId).name} from user ${user.username}`);
			console.log(err);
		}
	}

    // Add user to verified collection
	const new_verified = new verified({
		PRN: data.PRN,
		Username: user.username,
		ID: user.id,
	});
	await new_verified.save();

	// DM the user
	const dmApiUrl = `https://discord.com/api/users/@me/channels`;
	const dmApiData = {
		recipient_id: user.id,
	};
	let ableToDM = true;
	try {
		const response = await axios.post(dmApiUrl, dmApiData, { headers: discordApiHeaders });
		const dmChannelId = response.data.id;
		const dmMessage = `
Welcome to our humble little server, where the verification process is more rigorous than getting a security clearance for Area 51. 

Now, let's get to the good stuff - ⁠<#860224115633160203> . This is where all the cool kids hang out. Or at least, that's what we tell ourselves as we cry ourselves to sleep every night. But hey, at least we have each other, right? If you're feeling brave, you can also check out <#778823213345538068> and see if you're worthy of some extra roles and exclusive private channels.

And if you ever find yourself hopelessly lost and confused, don't worry. Our online \`${adminRoleName}\` or \`${modRoleName}\` are here to help... or at least, they'll try to help. No promises on the quality of their assistance though - they're not exactly successful JEE aspirants,.

**Roles added: ${branch}, ${campus} and ${year}. If any of these details are inaccurate or have changed, drop a message in <#860224115633160203> and ping the \`${adminRoleName}\` or any \`${modRoleName}\`.**

So buckle up, grab a drink, and let's have some fun. Or, you know, just sit back and watch the chaos unfold. Either way, we're happy to have you here!

(Do not reply to this bot. This message was auto-generated.)
		`;
		await axios.post(
			`https://discord.com/api/channels/${dmChannelId}/messages`,
			{ content: dmMessage },
			{ headers: discordApiHeaders }
		);
	} catch (err) {
        console.log(`Error DMing user ${user.id}`)
		console.log(err);
		ableToDM = false;
	}

	// Send logs to #verification thread under #bot-logs
	const logsApiUrl = `https://discord.com/api/channels/1100722146956820510/messages`;
	const content = `<@${user.id}>`;
	const embed = {
		title: "Success",
		color: 0x00ff00,
		timestamp: new Date(),
		fields: [
			{
				name: "User",
				value: `${user.username}`,
				inline: true,
			},
			{
				name: "ID",
				value: user.id,
				inline: true,
			},
			{
				name: "PRN",
				value: batch_details.PRN,
				inline: true,
			},
			{
				name: "Section",
				value: batch_details.Section,
				inline: true,
			},
			{
				name: "SRN",
				value: batch_details.SRN,
				inline: true,
			},
			{
				name: "Branch",
				value: batch_details.Branch,
				inline: true,
			},
			{
				name: "Campus",
				value: batch_details.Campus,
				inline: true,
			},
		],
	};
	if (!ableToDM) {
		embed.fields.push({
			name: "\u200b",
			value: "DMs were closed.",
			inline: true,
		});
	}
    try {
    	await axios.post(logsApiUrl, { content, embed }, { headers: discordApiHeaders });
    } catch (err) {
        console.log(`Error sending logs to #verification thread`)
        console.log(err);
    }

	res.status(200).json({
		message: "Success",
	});
};

export default handler;
