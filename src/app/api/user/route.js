import axios from "axios";
import { createResponse, fetchDiscordUser } from "@/utils/helpers";

export async function GET(request) {
  const auth = request.auth;
  let discordUser = await fetchDiscordUser(auth.access_token);
  discordUser = {
    ...discordUser,
    guild_info: {
      in_guild: false,
      is_verified: false,
      is_mod: false,
    },
  };
}
