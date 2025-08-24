import axios from "axios";
import { createResponse } from "@/utils/helpers";
import { CONSTANTS } from "@/utils/config";
import { getDmMessage, sendErrorLogsToDiscord } from "@/utils/helpers";
import { dbService } from "@/utils/dbservice";
import crypt from "crypto";

export async function GET(request) {
  // Get the encoded token from URL parameters
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return createResponse(400, "Bad Request", null, "Token is required");
  }

  let tokenData;
  try {
    // Get the secret for decryption
    const secret = process.env.JWT_SESSION_SECRET;
    if (!secret) {
      return createResponse(
        500,
        "Internal Server Error",
        null,
        "Server configuration error"
      );
    }

    // Decode and decrypt the token
    const encryptedToken = Buffer.from(token, "base64").toString("utf-8");
    const [ivHex, encrypted] = encryptedToken.split(":");

    if (!ivHex || !encrypted) {
      return createResponse(
        400,
        "Invalid token format",
        null,
        "The provided token is malformed"
      );
    }

    const algorithm = "aes-256-cbc";
    const key = crypt.scryptSync(secret, "salt", 32);
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypt.createDecipheriv(algorithm, key, iv);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    tokenData = JSON.parse(decrypted);

    // Basic token validation (check if it's not too old, e.g., 10 minutes)
    const tokenAge = Date.now() - tokenData.timestamp;
    if (tokenAge > 10 * 60 * 1000) {
      // 10 minutes
      return createResponse(
        400,
        "Token expired",
        null,
        "The authentication token has expired. Please authenticate again."
      );
    }
  } catch (error) {
    return createResponse(
      400,
      "Invalid token",
      null,
      "The provided token is invalid or could not be decrypted"
    );
  }

  const { discordUser, pesuUserProfile } = tokenData;

  try {
    // Check if PRN already exists using Prisma
    try {
      const prnExists = await dbService.link.prnExists(pesuUserProfile.prn);
      if (prnExists) {
        return createResponse(
          400,
          "PRN already linked",
          null,
          "PRN already linked with a different user. If you think this is a mistake, contact us."
        );
      }
    } catch (error) {
      console.error("Error checking PRN:", error);
      await sendErrorLogsToDiscord({
        content: `<@${discordUser.id}>`,
        embed: {
          title: "Error Checking PRN",
          color: 0xff0000,
          timestamp: new Date(),
          footer: {
            text: "PESU Bot",
          },
          fields: [
            {
              name: "PRN",
              value: pesuUserProfile.prn,
            },
            {
              name: "Error",
              value: `${error.message || "Unknown error"}`,
            },
          ],
        },
      });
      return createResponse(
        500,
        "Internal Server Error",
        null,
        "An error occurred while checking the PRN"
      );
    }

    // Make year: 4-8th characters from PRN
    const year = pesuUserProfile.prn.slice(4, 8);

    // Get branch short code from CONSTANTS
    // If not found, see if it exists in the BRANCH
    const branchShortCode =
      CONSTANTS.BRANCH_SHORT_CODES[pesuUserProfile.branch] ||
      Object.keys(CONSTANTS.GUILD.ROLES.BRANCH).find(
        (key) => key === pesuUserProfile.branch
      );
    if (!branchShortCode) {
      await sendErrorLogsToDiscord({
        content: `<@${discordUser.id}>`,
        embed: {
          title: "Branch to short code mapping not found",
          color: 0xff0000,
          timestamp: new Date(),
          footer: {
            text: "PESU Bot",
          },
          fields: [
            {
              name: "Username",
              value: discordUser.username,
              inline: true,
            },
            {
              name: "User ID",
              value: discordUser.id,
              inline: true,
            },
            { name: "PRN", value: pesuUserProfile.prn, inline: true },
            { name: "Branch", value: pesuUserProfile.branch, inline: true },
            { name: "Campus", value: pesuUserProfile.campus, inline: true },
            { name: "Year", value: year, inline: true },
          ],
        },
      });
      return createResponse(
        500,
        "Internal Server Error",
        null,
        "Unrecognized branch"
      );
    }

    // Get role IDs from CONSTANTS
    const roleIds = {
      branch: CONSTANTS.GUILD.ROLES.BRANCH[branchShortCode],
      campus: CONSTANTS.GUILD.ROLES.CAMPUS[pesuUserProfile.campus],
      year: CONSTANTS.GUILD.ROLES.YEAR[year],
    };
    // Check if all required roles are present
    if (!roleIds.branch || !roleIds.campus || !roleIds.year) {
      await sendErrorLogsToDiscord({
        content: `<@${discordUser.id}>`,
        embed: {
          title: "Roles missing",
          color: 0xff0000,
          timestamp: new Date(),
          footer: {
            text: "PESU Bot",
          },
          fields: [
            {
              name: "Username",
              value: discordUser.username,
              inline: true,
            },
            {
              name: "User ID",
              value: discordUser.id,
              inline: true,
            },
            { name: "PRN", value: pesuUserProfile.prn, inline: true },
            { name: "Branch", value: branchShortCode, inline: true },
            { name: "Campus", value: pesuUserProfile.campus, inline: true },
            { name: "Year", value: year, inline: true },
          ],
        },
      });
      return createResponse(
        500,
        "Internal Server Error",
        null,
        "Missing role IDs for branch, campus, or year"
      );
    }

    // Create (or update existing) student record using Prisma
    try {
      const studentData = {
        prn: pesuUserProfile.prn,
        branchFull: pesuUserProfile.branch,
        branchShort: branchShortCode,
        year: year,
        campusCode: pesuUserProfile.campus_code,
        campusShort: pesuUserProfile.campus,
      };

      await dbService.student.createOrUpdateStudentRecord(studentData);
    } catch (error) {
      await sendErrorLogsToDiscord({
        content: `<@${discordUser.id}>`,
        embed: {
          title: "Failed to create/update student record",
          color: 0xff0000,
          timestamp: new Date(),
          footer: {
            text: "PESU Bot",
          },
          fields: [
            {
              name: "Username",
              value: discordUser.username,
              inline: true,
            },
            {
              name: "User ID",
              value: discordUser.id,
              inline: true,
            },
            { name: "PRN", value: pesuUserProfile.prn, inline: true },
            { name: "Branch", value: branchShortCode, inline: true },
            { name: "Campus", value: pesuUserProfile.campus, inline: true },
            { name: "Year", value: year, inline: true },
            {
              name: "Error",
              value: `${error.message || "Unknown error"}`,
              inline: false,
            },
          ],
        },
      });
      return createResponse(
        500,
        "Failed to create/update student record",
        null,
        "An error occurred while creating/updating the student record"
      );
    }

    // Update the Discord user with the new roles
    try {
      await axios.patch(
        `https://discord.com/api/guilds/${CONSTANTS.GUILD.ID}/members/${discordUser.id}`,
        {
          roles: [
            CONSTANTS.GUILD.ROLES.LINKED, // Link role
            ...Object.values(roleIds), // Branch, campus, and year roles
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bot ${process.env.BOT_TOKEN}`,
          },
        }
      );
    } catch (error) {
      // Send logs to Discord
      await sendErrorLogsToDiscord({
        content: `<@${discordUser.id}>`,
        embed: {
          title: "Failed to update Discord roles",
          color: 0xff0000,
          timestamp: new Date(),
          footer: {
            text: "PESU Bot",
          },
          fields: [
            {
              name: "Username",
              value: discordUser.username,
              inline: true,
            },
            {
              name: "User ID",
              value: discordUser.id,
              inline: true,
            },
            { name: "PRN", value: pesuUserProfile.prn, inline: true },
            { name: "Branch", value: branchShortCode, inline: true },
            { name: "Campus", value: pesuUserProfile.campus, inline: true },
            { name: "Year", value: year, inline: true },
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
        "Failed to update Discord roles",
        null,
        "An error occurred while updating the Discord roles"
      );
    }

    let promises = [];

    // Add the user to linked collection using Prisma
    promises.push(
      dbService.link.createLinkRecord(discordUser.id, pesuUserProfile.prn)
    );

    // DM the user with the welcome message
    promises.push(
      axios
        .post(
          `https://discord.com/api/users/@me/channels`,
          {
            recipient_id: discordUser.id,
          },
          {
            headers: {
              Authorization: `Bot ${process.env.BOT_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then((dmResponse) => {
          return axios.post(
            `https://discord.com/api/channels/${dmResponse.data.id}/messages`,
            {
              content: getDmMessage(
                branchShortCode,
                pesuUserProfile.campus,
                year
              ),
            },
            {
              headers: {
                Authorization: `Bot ${process.env.BOT_TOKEN}`,
                "Content-Type": "application/json",
              },
            }
          );
        })
    );

    // Send log message to the logs channel
    promises.push(
      axios.post(
        `https://discord.com/api/channels/${CONSTANTS.GUILD.CHANNELS.LOGS.THREADS.VERIFICATION_LOGS.ID}/messages`,
        {
          content: `<@${discordUser.id}>`,
          embed: {
            title: "User Linked",
            color: 0x00ff00,
            timestamp: new Date(),
            footer: {
              text: "PESU Bot",
            },
            fields: [
              {
                name: "Username",
                value: discordUser.username,
                inline: true,
              },
              { name: "User ID", value: discordUser.id, inline: true },
              { name: "PRN", value: pesuUserProfile.prn, inline: true },
              { name: "Branch", value: branchShortCode, inline: true },
              { name: "Campus", value: pesuUserProfile.campus, inline: true },
              { name: "Year", value: year, inline: true },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bot ${process.env.BOT_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      )
    );

    // Wait for all promises to resolve
    try {
      await Promise.all(promises);
    } catch (error) {
      console.error("Error in promises:", error);
    }

    return createResponse(200, "User linked successfully", {
      discordUser,
      pesuProfile: pesuUserProfile,
      branch: branchShortCode,
      campus: pesuUserProfile.campus,
      year: year,
    });
  } catch (error) {
    await sendErrorLogsToDiscord({
      embed: {
        title: "Unknown Error Linking User",
        color: 0xff0000,
        timestamp: new Date(),
        footer: {
          text: "PESU Bot",
        },
        fields: [
          {
            name: "Error",
            value: `${error.message || "Unknown error"}`,
            inline: false,
          },
        ],
      },
    });
    return createResponse(
      500,
      "Internal Server Error",
      null,
      error.message || "An error occurred while linking the user"
    );
  }
}
