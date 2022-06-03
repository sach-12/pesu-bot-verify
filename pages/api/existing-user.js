import roleAlreadyExists from "../../utils/roleAlreadyExists";
import { getUserClientId } from "../../utils/discordClient";

// This API is used to check if the user already has the verified role
// Called on page load

const handler = async (req, res) => {
    // Reject any request that is not a POST
    if(req.method === "POST") {
        const code = req.body.code;
        const userId = await getUserClientId(code);
        const roleExists = await roleAlreadyExists(userId);
        if(roleExists) {
            res.status(403).json({
                message: "You're already verified. Are you trying to steal someone's identity, you naughty lil..."
            });
            return;
        } else {
            res.status(200).json({
                message: "OK"
            });
            return;
        }
    }
    else {
        res.status(405).json({
            message: "Method not allowed"
        });
        return;
    }    
}

export default handler