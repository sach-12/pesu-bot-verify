import jwt from "jsonwebtoken";
import axios from "axios";
import { createResponse } from "@/utils/helpers";
import { cookies } from "next/headers";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return createResponse(
      400,
      "Bad Request",
      null,
      "Missing 'code' parameter in the request"
    );
  }

  try {
    const apiResponse = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.REDIRECT_URI,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        auth: {
          username: process.env.CLIENT_ID,
          password: process.env.CLIENT_SECRET,
        },
      }
    );
    if (apiResponse.status !== 200) {
      return createResponse(
        apiResponse.status,
        "Failed to retrieve token",
        null,
        apiResponse.data || "An error occurred while retrieving the token"
      );
    }
    const token = apiResponse.data;
    const jwtToken = jwt.sign(token, process.env.JWT_SESSION_SECRET);

    // Set the JWT token in a cookie
    const response = createResponse(200, "Token retrieved successfully");
    const cookiesStore = await cookies();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    cookiesStore.set("pd-session-jwt", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "lax", // Adjust as necessary
      expires: expiresAt,
      path: "/",
    });
    // response.headers.set(
    //   "Set-Cookie",
    //   `pd-session-jwt=${jwtToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`
    // );
    return response;
  } catch (error) {
    return createResponse(
      error.response?.status || 500,
      "Failed to retrieve token",
      error.response?.data || null,
      error.message || "An unexpected error occurred"
    );
  }
}
