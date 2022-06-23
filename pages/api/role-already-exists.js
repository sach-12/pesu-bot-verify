import { getUserClientId } from "../../utils/discordMember";
import roleAlreadyExists from "../../utils/roleAlreadyExists";
import { runCors, runLimiter, runUserIdLimiter } from "../../utils/middleware";

// This API is used to retrive the user's client ID with the user's access token
// and check if he/she already has the "Verified" role

const handler = async (req, res) => {
    // Middleware
    await runCors(req, res, "POST");
    // await runLimiter(req, res);
    await runUserIdLimiter(req, res);

    // Reject any request that is not a POST
    if (req.method === "POST") {
        const userToken = req.body.userToken;
        const userId = await getUserClientId(userToken);
        if (!userId) {
            res.status(401).json({
                message: "Authentication failed"
            });
            return;
        }
        const roleExists = await roleAlreadyExists(userId);
        if (roleExists) {
            res.status(403).json({
                message: "You're already verified. Are you trying to steal someone's identity, you naughty lil..."
            });
            return;
        }
        else{
            res.status(200).json({
                message: "OK"
            });
            return;
        }
    } else {
        res.status(405).json({
            message: "Method not allowed"
        });
        return;
    }
}

export default handler;