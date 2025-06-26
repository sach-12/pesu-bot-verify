import axios from "axios";

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
    return response.data;
  } catch (error) {
    console.error("Error fetching Discord user:", error);
    return null;
  }
};
