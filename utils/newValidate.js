import { getGuild } from "./discordClient";
import batch from "./dbmodels/batchDetails";
import verified from "./dbmodels/verified";
import config from "./rolesAndChannelIds";
import { MessageEmbed, DiscordAPIError } from "discord.js";

const newValidate = async(userId, prn) => {
    try {
        const guild = await getGuild();
        const member = await guild.members.fetch(userId);
        const batchDetails = await batch.findOne({ PRN: prn });

        // DM the user
        const dmChannel = await member.createDM();
        let adminRoleName = guild.roles.cache.get(config.Admin)
        if(!adminRoleName) {
            adminRoleName = "Admin"
        }
        else {
            adminRoleName = adminRoleName.name
        }
        let modRoleName = guild.roles.cache.get(config.Moderator)
        if(!modRoleName) {
            modRoleName = "Moderator"
        }
        else {
            modRoleName = modRoleName.name
        }
        const dmContent = `Thanks for verifying yourself. <#${config.Lobby}> is the general lobby where you can say hi and talk with everyone. You can also head over to <#${config.Additional_Roles}> to pick up additional roles for certain private channels.\nIf you need any help, you can text any online \`${adminRoleName}\` or \`${modRoleName}\`. Have fun!\n\n(Do not reply to this bot. This message was auto-generated)`
        let ableToSend = true
        try {
            await dmChannel.send(dmContent);
        } catch (error) {
            if (error instanceof DiscordAPIError) {
                ableToSend = false
            }
            else {
                throw error
            }
        }

        // Get appropriate role IDs based on branch, year and campus
        const branch = batchDetails.Branch;
        const branchRoleId = config[branch];
        const year = prn.toString().toUpperCase().slice(6, 8);
        const yearRoleId = config[year];
        const campus = batchDetails.Campus;
        let campusRoleId = config.RR;
        if (campus.includes("Electronic")) {
            campusRoleId = config.EC;
        }

        const variantRoleId = config.Validated;
        const justJoinedRoleId = config.Just_Joined;

        // Add roles to user and remove justJoined role
        await member.roles.add([branchRoleId, yearRoleId, campusRoleId, variantRoleId]);
        await member.roles.remove(justJoinedRoleId);

        // Add username, PRN and discord ID to verified table in MongoDB
        const verifiedData = {
            PRN: prn,
            ID: member.id,
            Username: member.user.username
        }
        const verifiedDoc = new verified(verifiedData);
        await verifiedDoc.save();

        // Send details to bot-logs channel
        const botLogsChannel = await guild.channels.fetch(config.Bot_Logs);
        const successEmbed = new MessageEmbed({
            title: "Success",
            color: "GREEN",
            timestamp: Date.now()
        })
        .addFields([
            { name: "User", value: member.user.username, inline: true },
            { name: "ID", value: member.id, inline: true },
            { name: "PRN", value: prn, inline: true },
            { name: "SRN", value: batchDetails.SRN, inline: true },
            { name: "Section", value: batchDetails.Section, inline: true },
            { name: "Branch", value: batchDetails.Branch, inline: true },
            { name: "Semester", value: batchDetails.Semester, inline: true },
            { name: "Cycle", value: batchDetails.Cycle, inline: true },
            { name: "Campus and Branch", value: batchDetails.CandB, inline: true },
            { name: "Campus", value: batchDetails.Campus, inline: true }
        ]);
        if(!ableToSend) {
            successEmbed.addField("\u200b", "DMs were closed", true)
        }
        await botLogsChannel.send({
            embeds: [successEmbed]
        });

        return true
    } catch (error) {
        const botLogsChannel = await guild.channels.fetch(config.Bot_Logs);
        const errorContent = `Error in validate:\n${error}\n\nfor PRN: ${prn} and user ID: ${userId}`
        await botLogsChannel.send(errorContent);
        return false
    }
}

export default newValidate;