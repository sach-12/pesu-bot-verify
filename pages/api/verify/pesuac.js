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

	const { username, password } = req.body;

	if (!username || !password) {
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
		console.log(`Error in checking if ${user.username} has verified role`);
		console.log(err);
		return res.status(403).json({
			message: "User not in server",
		});
	}

	const pesuAuthUrl = "https://pesu-auth.onrender.com/authenticate";
	const payload = {
		username,
		password,
		profile: true,
		know_your_class_and_section: true,
	};
	const headers = {
		"Content-Type": "application/json",
	};

	// PESU Academy auth and add to database
	try {
		var response = await axios.post(pesuAuthUrl, JSON.stringify(payload), { headers });
		var branch = null;
		var campus = null;
		var year = null;
		if (response.data.status) {
			// Connect to database
			await connect();

			// check if user's PRN is already verified
			const is_verified = await verified.exists({ PRN: response.data.profile.prn });
			if (is_verified) {
				return res.status(403).json({
					message: "PRN already verified with a different user. If you think this is a mistake, contact us.",
				});
			}

			// create batch details if not exists
			var batchDetails = await batch.findOne({ PRN: response.data.profile.prn });
			if (!batchDetails) {
				if (response.data.know_your_class_and_section?.branch && response.data.know_your_class_and_section?.branch !== "NA") {
					branch = response.data.know_your_class_and_section?.branch;
				} else if (response.data.profile.branch_short_code && response.data.profile.branch_short_code !== "NA") {
					branch = response.data.profile.branch_short_code;
				} else {
					return res.status(500).json({
						message: "Branch not found. You're gonna have to wait for a while.",
					});
				}
				// if (
				// 	response.data.know_your_class_and_section?.department &&
				// 	response.data.know_your_class_and_section?.department.includes("Campus")
				// ) {
				// 	campus = response.data.know_your_class_and_section?.department.includes(
				// 		"Electronic"
				// 	)
				// 		? "EC"
				// 		: "RR";
				// } else {
				// 	campus = response.data.profile.campus;
				// }
				campus = response.data.profile.campus;
				year = response.data.profile.prn.toString().toUpperCase().slice(4, 8);
				const newBatchDetails = new batch({
					PRN: response.data.profile.prn,
					SRN:
						response.data.profile.srn ||
						response.data.know_your_class_and_section?.srn ||
						"NA",
					Semester:
						response.data.profile.section ||
						response.data.know_your_class_and_section?.class ||
						"NA",
					Section:
						response.data.profile.section ||
						response.data.know_your_class_and_section?.section ||
						"NA",
					Cycle: response.data.know_your_class_and_section?.cycle || "NA",
					CandB: response.data.know_your_class_and_section?.department || "NA",
					Branch: response.data.know_your_class_and_section?.branch || "NA",
					Campus: response.data.know_your_class_and_section?.institute_name || "NA",
				});
				// await newBatchDetails.save(); // Hotfix for current auth issues
				batchDetails = newBatchDetails;
			} else {
				branch = batchDetails.Branch;
				campus = batchDetails.Campus.includes("Electronic") ? "EC" : "RR";
				year = batchDetails.PRN.toString().toUpperCase().slice(4, 8);
			}
		} else {
			return res.status(403).json({
				message: response.data.message,
			});
		}
	} catch (err) {
        console.log(`Error in PESU Academy auth for ${user.id}`);
		console.log(err);
		return res.status(500).json({
			message: "Internal Server Error",
		});
	}

	// Get role IDs of the above roles from the server
	const rolesApiUrl = `https://discord.com/api/guilds/742797665301168220/roles`;
	try {
		var rolesApiResponse = await axios.get(rolesApiUrl, { headers: discordApiHeaders });
	} catch (err) {
		console.log(`Error in getting roles from server`);
		console.log(err);
		return res.status(500).json({
			message: "Internal Server Error",
		});
	}

	try {
		var roles = rolesApiResponse.data;
        console.log(`User ID: ${user.id}`)
        console.log(`Branch: ${branch}, Year: ${year}, Campus: ${campus}`)
		var branchRoleId = roles.find((role) => role.name === branch).id;
		var yearRoleId = roles.find((role) => role.name === year).id;
		var campusRoleId = roles.find((role) => role.name === campus).id;
	} catch (err) {
        console.log(`Error in getting role IDs`);
        console.log(err);
		const threadMessageUrl = `https://discord.com/api/channels/1129317221848596490/messages`;
		const threadMessageData = {
			embeds: [
				{
					title: `Roles missing`,
					fields: [
						{
							name: "User",
							value: `<@${user.id}>`,
							inline: true,
						},
						{
							name: "User ID",
							value: user.id,
							inline: true,
						},
						{
							name: "PRN",
							value: response.data.profile.prn,
							inline: true,
						},
						{
							name: "Branch",
							value: branch,
							inline: true,
						},
						{
							name: "Year",
							value: year,
							inline: true,
						},
						{
							name: "Campus",
							value: campus,
							inline: true,
						},
					],
					color: 0xff0000,
					timestamp: new Date(),
					footer: {
						text: "PESU Bot",
					},
				},
			],
		};
		try {
			await axios.post(threadMessageUrl, threadMessageData, {
				headers: discordApiHeaders,
			});
		} catch (err) {
			console.log(`Error in sending message to thread`);
			console.log(err);
		}
		return res.status(500).json({
			message: "Internal Server Error. You will be notified when this is fixed.",
		});
	}
	const verifiedRoleId = "749683320941445250";
	const adminRoleName = roles.find((role) => role.id === "742800061280550923").name;
	const modRoleName = roles.find((role) => role.id === "742798158966292640").name;

	const guideMemberUpdateUrl = `https://discord.com/api/guilds/742797665301168220/members/${user.id}`;
	const guideMemberUpdateData = {
		roles: [branchRoleId, yearRoleId, campusRoleId, verifiedRoleId],
	};
	try {
		await axios.patch(guideMemberUpdateUrl, guideMemberUpdateData, {
			headers: discordApiHeaders,
		});
	} catch (err) {
		console.log(`Error in updating roles of user`);
		console.log(err);
		return res.status(500).json({
			message: "Internal Server Error. Code: 1",
		});
	}

	let promises = [];
	// Add user to verified collection
	const new_verified = new verified({
		PRN: batchDetails.PRN,
		Username: user.username,
		ID: user.id,
	});
	const promise1 = new_verified.save();
	promises.push(promise1);

	// DM the user
	const dmApiUrl = `https://discord.com/api/users/@me/channels`;
	const dmApiData = {
		recipient_id: user.id,
	};
	const promise2 = axios
		.post(dmApiUrl, dmApiData, { headers: discordApiHeaders })
		.then(async (res) => {
			const dmChannelId = res.data.id;
			const dmMessage = `
Welcome to our humble little server, where the verification process is more rigorous than getting a security clearance for Area 51. 

Now, let's get to the good stuff - ⁠<#860224115633160203> . This is where all the cool kids hang out. Or at least, that's what we tell ourselves as we cry ourselves to sleep every night. But hey, at least we have each other, right? If you're feeling brave, you can also check out <#778823213345538068> and see if you're worthy of some extra roles and exclusive private channels.

And if you ever find yourself hopelessly lost and confused, don't worry. Our online \`${adminRoleName}\` or \`${modRoleName}\` are here to help... or at least, they'll try to help. No promises on the quality of their assistance though - they're not exactly successful JEE aspirants.

**Roles added: ${branch}, ${campus} and ${year}. If any of these details are inaccurate or have changed, drop a message in <#860224115633160203> and ping the \`${adminRoleName}\` or any \`${modRoleName}\`.**

So buckle up, grab a drink, and let's have some fun. Or, you know, just sit back and watch the chaos unfold. Either way, we're happy to have you here!

(Do not reply to this bot. This message was auto-generated.)
                `;
			await axios.post(
				`https://discord.com/api/channels/${dmChannelId}/messages`,
				{ content: dmMessage },
				{ headers: discordApiHeaders }
			);
		});
	promises.push(promise2);

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
				value: batchDetails.PRN,
				inline: true,
			},
			{
				name: "Section",
				value: batchDetails.Section,
				inline: true,
			},
			{
				name: "SRN",
				value: batchDetails.SRN,
				inline: true,
			},
			{
				name: "Branch",
				value: batchDetails.Branch,
				inline: true,
			},
			{
				name: "Campus",
				value: batchDetails.Campus,
				inline: true,
			},
		],
	};
	const promise3 = axios.post(logsApiUrl, { content, embed }, { headers: discordApiHeaders });
	promises.push(promise3);

	try {
		await Promise.all(promises);
	} catch (err) {
		console.log("Error in resolving promises");
		console.log(err);
	}

	res.status(200).json({
		message: "Success",
	});
};

export default handler;
