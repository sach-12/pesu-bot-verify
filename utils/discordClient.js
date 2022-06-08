// This file is for the bot client
import { Client, Intents } from "discord.js";

// Bot Intents for PESU Bot
const botIntents = new Intents();
botIntents.add(
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
);

let client = null;

// Singleton method for bot login
const getBotClient = async() => {
    if(client === null) {
        client = new Client({
            intents: botIntents
        });
        await client.login(process.env.PESU_BOT_TOKEN);
    }
    return client;
}

// Get guild object with bot login
const getGuild = async() => {
    await getBotClient();
    const guild = await client.guilds.fetch(process.env.PESU_DISCORD_GUILD_ID)
    return guild;
}

export { getBotClient, getGuild };
