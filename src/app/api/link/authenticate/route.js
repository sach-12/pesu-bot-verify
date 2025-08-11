import axios from "axios";
import { createResponse, fetchDiscordUser } from "@/utils/helpers";
import { sendErrorLogsToDiscord } from "@/utils/helpers";
import crypt from "crypto";

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

  // Check if the user is already linked
  if (discordUser.guild_info.has_linked) {
    return createResponse(
      400,
      "User already linked",
      null,
      "This Discord user is already linked to a PESU Academy account"
    );
  }

  // Check request fields
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");
  const password = searchParams.get("password");
  if (!username || !password) {
    return createResponse(
      400,
      "Bad Request",
      null,
      "Username and password are required"
    );
  }

  // Run pesu-auth service to authenticate the user
  try {
    const payload = {
      username,
      password,
      profile: true,
      fields: ["prn", "branch", "campus", "campus_code"],
    };

    const response = await axios.post(
      "https://pesu-auth.onrender.com/authenticate",
      JSON.stringify(payload),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status !== 200 || !response.data?.status) {
      await sendErrorLogsToDiscord({
        content: `<@${discordUser.id}>`,
        embed: {
          title: "PESU Auth Error",
          color: 0xff0000,
          timestamp: new Date(),
          footer: {
            text: "PESU Bot",
          },
          fields: [
            { name: "Response Code", value: response.status, inline: false },
            {
              name: "Error",
              value:
                response.data?.message ||
                response.data?.error ||
                "Unknown error",
              inline: false,
            },
          ],
        },
      });
      return createResponse(
        500,
        "Failed to authenticate PESU user",
        null,
        response.data?.message ||
          "An error occurred while authenticating the PESU user"
      );
    }

    // Check if the PESU profile contains all the required fields
    const pesuUserProfile = response.data.profile;
    for (const field of payload.fields) {
      if (!pesuUserProfile[field]) {
        console.error(
          `Missing field in PESU profile: ${field}`,
          pesuUserProfile
        );
        await sendErrorLogsToDiscord({
          content: `<@${discordUser.id}>`,
          embed: {
            title: "Missing PESU Profile Field",
            color: 0xff0000,
            timestamp: new Date(),
            footer: {
              text: "PESU Bot",
            },
            fields: [
              {
                name: "Missing Field",
                value: field,
              },
              {
                name: "User Profile",
                value: JSON.stringify(pesuUserProfile),
              },
            ],
          },
        });
        return createResponse(
          500,
          "Internal Server Error",
          null,
          "Missing fields from PESU Auth"
        );
      }
    }

    // Create encrypted token containing discord user info and PESU profile
    const tokenData = {
      discordUser: {
        id: discordUser.id,
        username: discordUser.username,
      },
      pesuUserProfile,
      timestamp: Date.now(),
    };

    // Encrypt the token data using JWT_SESSION_SECRET
    const secret = process.env.JWT_SESSION_SECRET;
    if (!secret) {
      return createResponse(
        500,
        "Internal Server Error",
        null,
        "Server configuration error"
      );
    }

    const algorithm = "aes-256-cbc";
    const key = crypt.scryptSync(secret, "salt", 32);
    const iv = crypt.randomBytes(16);
    const cipher = crypt.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(JSON.stringify(tokenData), "utf8", "hex");
    encrypted += cipher.final("hex");

    // Combine IV and encrypted data for the token
    const encryptedToken = iv.toString("hex") + ":" + encrypted;
    const encodedToken = Buffer.from(encryptedToken).toString("base64");

    return createResponse(200, "Authentication successful", {
      token: encodedToken,
      pesuProfile: pesuUserProfile,
    });
  } catch (error) {
    await sendErrorLogsToDiscord({
      content: `<@${discordUser.id}>`,
      embed: {
        title: "Unknown Error in Authentication",
        color: 0xff0000,
        timestamp: new Date(),
        footer: {
          text: "PESU Bot",
        },
        fields: [
          {
            name: "Error",
            value: `${error.message || "Unknown error"} | ${
              error.response?.data?.message || "No additional info"
            }`,
            inline: false,
          },
        ],
      },
    });
    return createResponse(
      500,
      "Internal Server Error",
      null,
      error.message || "An error occurred during authentication"
    );
  }
}
