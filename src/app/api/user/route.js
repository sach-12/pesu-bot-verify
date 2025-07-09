import { createResponse, fetchDiscordUser } from "@/utils/helpers";

export async function GET(request) {
  const access_token = request.headers.get("auth-token");
  const discordUser = await fetchDiscordUser(access_token);

  if (!discordUser) {
    return createResponse(
      500,
      "Failed to retrieve user data from Discord",
      null,
      "An error occurred while fetching user data"
    );
  }

  return createResponse(200, "User data retrieved successfully", discordUser);
}
