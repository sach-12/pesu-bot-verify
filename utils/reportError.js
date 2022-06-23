import { getGuild } from "./discordClient";
import config from "./rolesAndChannelIds"
import { MessageEmbed } from "discord.js";

const reportError = async (memberId, errorType, data) => {
    const guild = await getGuild();
    const channel = await guild.channels.fetch(config.Bot_Logs);
    const errorEmbed = new MessageEmbed()
        .setTitle(`${errorType}`)
        .setColor("#ff0000")
        .setTimestamp(Date.now());
    errorEmbed.addField("Member", `<@${memberId}>`);
    errorEmbed.addField("Error Message", data);
    const errorMessage = await channel.send({
        embeds: [errorEmbed]
    });
    return errorMessage.id;
}

export default reportError;