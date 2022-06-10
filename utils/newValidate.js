import { getBotClient, getGuild } from "./discordClient";
import batch from "./dbmodels/batchDetails";
import verified from "./dbmodels/verified";

const newValidate = async(userId, prn) => {
    const botClient = await getBotClient();
    const guild = await getGuild();
    const member = await guild.members.fetch(userId);
    const batchDetails = await batch.findOne({ PRN: prn });

    
}

export default newValidate;