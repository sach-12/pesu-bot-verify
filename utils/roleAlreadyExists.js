import {getGuild} from "./discordClient";

// This function checks if a member based on member ID already has the verified role
const roleAlreadyExists = async(memberId) => {
    const guild = await getGuild();
    const member = await guild.members.fetch(memberId);
    let ret = false;
    if (member._roles.includes(process.env.PESU_DISCORD_VERIFIED_ROLE_ID)) {
        ret = true;
    }
    return ret;
}

export default roleAlreadyExists;
