// This file is for the user client
import axios from "axios";

// Exchange code for access token
// Refer to: https://discord.com/developers/docs/topics/oauth2#authorization-code-grant
const getUserAccessToken = async (code) => {
    const tokenUrl = "https://discord.com/api/oauth2/token";
    const tokenData = new URLSearchParams();
    tokenData.append("grant_type", "authorization_code");
    tokenData.append("code", code);
    tokenData.append("redirect_uri", process.env.PESU_DISCORD_REDIRECT_URI);
    const tokenHeaders = {
        "Content-Type": "application/x-www-form-urlencoded"
    };
    try {
        console.log(tokenData);
        console.log(process.env.PESU_DISCORD_CLIENT_ID);
        console.log(process.env.PESU_DISCORD_CLIENT_SECRET);
        const tokenResponse = await axios.post(
            tokenUrl, tokenData, {
                headers: tokenHeaders,
                auth: {
                    username: process.env.PESU_DISCORD_CLIENT_ID,
                    password: process.env.PESU_DISCORD_CLIENT_SECRET
                }
            }
        )
        return tokenResponse.data.access_token;
    }
    catch (error) {
        // console.log(error)
        return null;
    }
};

// Get user ID from access token
// Refer to: https://discord.com/developers/docs/resources/user#get-current-user
const getUserClientId = async (token) => {
    const userUrl = "https://discord.com/api/users/@me";
    const userHeaders = {
        "Authorization": `Bearer ${token}`
    };
    try {
        const response = await axios.get(userUrl, {headers: userHeaders});
        return response.data.id;
    } catch (error) {
        return null;
    }
};

export {getUserAccessToken, getUserClientId};