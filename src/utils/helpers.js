import axios from "axios";
import { CONSTANTS } from "@/utils/config";

export const createResponse = (
  statusCode = 200,
  message = null,
  data = null,
  error = null
) => {
  return new Response(JSON.stringify({ statusCode, message, data, error }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const fetchDiscordUser = async (accessToken) => {
  try {
    const response = await axios.get("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    let discordUser = {
      ...response.data,
      guild_info: {
        in_guild: false,
        has_linked: false,
        is_mod: false,
      },
    };

    // Check guild membership and roles
    const discordApiUrl = `https://discord.com/api/guilds/${CONSTANTS.GUILD.ID}/members/${discordUser.id}`;
    const discordApiHeaders = {
      "Content-Type": "application/json",
      "Authorization": `Bot ${process.env.BOT_TOKEN}`,
    };

    try {
      const guildResponse = await axios.get(discordApiUrl, {
        headers: discordApiHeaders,
      });
      discordUser.guild_info = {
        in_guild: true,
        has_linked: guildResponse.data.roles.includes(
          CONSTANTS.GUILD.ROLES.LINKED
        ),
        is_mod:
          guildResponse.data.roles.includes(CONSTANTS.GUILD.ROLES.MOD) ||
          guildResponse.data.roles.includes(CONSTANTS.GUILD.ROLES.ADMIN),
      };
    } catch (guildError) {
      console.log("User not in guild or guild check failed:", guildError.message);
    }

    return discordUser;
  } catch (error) {
    console.error("Error fetching Discord user:", error);
    return null;
  }
};

export const getDmMessage = (branch, campus, year) => {
  return `Welcome to our humble little server, where the linking process is more rigorous than getting a security clearance for Area 51. 

**Roles added: ${branch}, ${campus} and ${year}. If any of these details are inaccurate or have changed, drop a message in <#${CONSTANTS.GUILD.CHANNELS.LOBBY.ID}> and ping the admin or any moderators.**

Now, let's get to the good stuff - ⁠<#${CONSTANTS.GUILD.CHANNELS.LOBBY.ID}> . This is where all the cool kids hang out. Or at least, that's what we tell ourselves as we cry ourselves to sleep every night. But hey, at least we have each other, right? If you're feeling brave, you can also check out <#${CONSTANTS.GUILD.CHANNELS.ADDITIONAL_ROLES.ID}> and see if you're worthy of some extra roles and exclusive private channels.

And if you ever find yourself hopelessly lost and confused, don't worry. Our online admin or moderators are here to help... or at least, they'll try to help. No promises on the quality of their assistance though - they're not exactly successful JEE aspirants.

So buckle up, grab a drink, and let's have some fun. Or, you know, just sit back and watch the chaos unfold. Either way, we're happy to have you here!

(Do not reply to this bot. This message was auto-generated.)`.trim();
};

export const sendErrorLogsToDiscord = async (payload) => {
  try {
    await axios.post(
      `https://discord.com/api/channels/${CONSTANTS.GUILD.CHANNELS.LOGS.THREADS.ERROR_LOGS.ID}/messages`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bot ${process.env.BOT_TOKEN}`,
        },
      }
    );
  } catch (error) {
    console.error("Error sending error log to Discord:", error);
  }
};
