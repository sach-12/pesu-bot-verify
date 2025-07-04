import axios from "axios";
import { constants } from "@/utils/config";
import { createResponse, fetchDiscordUser } from "@/utils/helpers";

export async function GET(request) {
  const access_token = request.headers.get('auth-token');
  let discordUser = await fetchDiscordUser(access_token);
  discordUser = {
    ...discordUser,
    guild_info: {
      in_guild: false,
      is_verified: false,
      is_mod: false,
    },
  };

  const discordApiUrl = `https://discord.com/api/guilds/742797665301168220/members/${discordUser.id}`;
  const discordApiHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bot ${process.env.BOT_TOKEN}`,
  };

  try {
    const response = await axios.get(discordApiUrl, {
      headers: discordApiHeaders,
    });
    discordUser.guild_info = {
      in_guild: true,
      is_verified: response.data.roles.includes(constants.GUILD.ROLES.VERIFIED),
      is_mod: response.data.roles.includes(constants.GUILD.ROLES.MOD) || response.data.roles.includes(constants.GUILD.ROLES.ADMIN),
    };
  } catch (error) {
    return createResponse(
      500,
      "Failed to retrieve user data from Discord",
      null,
      error.response?.data?.message || "An error occurred while fetching user data"
    );
  }

  return createResponse(200, "User data retrieved successfully", discordUser);
}
