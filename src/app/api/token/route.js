import { SignJWT } from "jose";
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
    const redirect_uri = process.env.NEXT_PUBLIC_REDIRECT_URI;
    const apiResponse = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirect_uri,
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
    const iat = Math.floor(Date.now() / 1000);
    const expiresAt = new Date(iat * 1000 + token.expires_in * 1000);
    const jwtToken = await new SignJWT(token)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(iat)
      .setNotBefore(iat)
      .setExpirationTime(expiresAt)
      .sign(new TextEncoder().encode(process.env.JWT_SESSION_SECRET));

    // Set the JWT token in a cookie
    const response = createResponse(200, "Token retrieved successfully");
    const cookiesStore = cookies();
    // Set the cookie with appropriate options
    cookiesStore.set("pd_cookie", jwtToken, {
      httpOnly: true,
      secure: process.env.NEXT_PUBLIC_APP_ENV === "prod", // Use secure cookies in production
      sameSite: "lax", // Adjust as necessary
      expires: expiresAt,
      path: "/",
    });
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
