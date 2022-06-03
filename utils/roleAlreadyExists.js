import {getGuild} from "./discordClient";

// This function checks if a member based on member ID already has the verified role
const roleAlreadyExists = async(memberId) => {
    const guild = await getGuild();
    const member = guild.members.cache.get(memberId);
    const role = guild.roles.cache.get(process.env.PESU_DISCORD_VERIFIED_ROLE_ID);
    let ret = false;
    if (member.roles.cache.has(role.id)) {
        ret = true;
    }
    return ret;
}

export default roleAlreadyExists;
