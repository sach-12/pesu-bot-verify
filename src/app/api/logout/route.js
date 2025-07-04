import axios from "axios";
import { cookies } from "next/headers";
import { createResponse } from "@/utils/helpers";

export async function GET(request) {
  try {
    const accessToken = request.headers.get("auth-token");

    // Clear the session cookie
    const cookiesStore = cookies();
    cookiesStore.delete("pd_cookie");

    // Revoke the access token with Discord
    const url = "https://discord.com/api/oauth2/token/revoke";
    const data = new URLSearchParams({
      token: accessToken,
    });
    try {
      await axios.post(url, data, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        auth: {
          username: process.env.CLIENT_ID,
          password: process.env.CLIENT_SECRET,
        },
      });
    } catch (err) {}
    return createResponse(200, "Logged out successfully");
  } catch (error) {
    return createResponse(
      500,
      "Internal Server Error",
      null,
      "An error occurred while logging out"
    );
  }
}
