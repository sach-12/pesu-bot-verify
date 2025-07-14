import axios from "axios";
import { createResponse, fetchDiscordUser } from "@/utils/helpers";
import { models, connectToDatabase, CONSTANTS } from "@/utils/config";
import { getDmMessage, sendErrorLogsToDiscord } from "@/utils/helpers";

export async function POST(request) {
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
  const { username, password } = await request.json();
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

    // Connect to MongoDB
    await connectToDatabase();

    // Check if the PRN is already linked
    const isPrnLinked = await models.Link.prnExists(pesuUserProfile.prn);
    if (isPrnLinked) {
      return createResponse(
        400,
        "PRN already linked",
        null,
        "PRN already linked with a different user. If you think this is a mistake, contact us."
      );
    }

    // Make year: 4-8th characters from PRN
    const year = pesuUserProfile.prn.slice(4, 8);

    // Get branch short code from CONSTANTS
    const branchShortCode =
      CONSTANTS.BRANCH_SHORT_CODES[pesuUserProfile.branch];
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

    // Create (or update existing) student record
    await models.Student.createOrUpdateStudentRecord({
      prn: pesuUserProfile.prn,
      branch: {
        full: pesuUserProfile.branch,
        short: branchShortCode,
      },
      year: year,
      campus: {
        code: pesuUserProfile.campus_code,
        short: pesuUserProfile.campus,
      },
    });

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
            "Authorization": `Bot ${process.env.BOT_TOKEN}`,
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

    // Add the user to linked collection
    promises.push(
      models.Link.createLinkRecord(discordUser.id, pesuUserProfile.prn)
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
              "Authorization": `Bot ${process.env.BOT_TOKEN}`,
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
                "Authorization": `Bot ${process.env.BOT_TOKEN}`,
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
            "Authorization": `Bot ${process.env.BOT_TOKEN}`,
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

    return createResponse(200, "User linked successfully", discordUser);
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
      error.message || "An error occurred while linking the user"
    );
  }
}
