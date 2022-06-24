import alreadyValidated from "../../utils/alreadyValidated";
import { getUserClientId } from "../../utils/discordMember";
import { runCors, runLimiter, runUserIdLimiter } from "../../utils/middleware";

// This API checks if the user's PRN is already on the verified collection in MongoDB
const handler = async (req, res) => {
    // Middleware
    await runCors(req, res, "POST");
    await runLimiter(req, res);
    await runUserIdLimiter(req, res);

    // Reject any request that is not a POST
    if (req.method === "POST") {
        const userToken = req.body.userToken;
        const prn = req.body.prn;
        if (!prn || !userToken) {
            res.status(400).json({
                message: "Missing body parameter: prn or userToken"
            });
            return;
        }
        const userClientId = await getUserClientId(userToken);
        if (!userClientId) {
            res.status(401).json({
                message: "Invalid user token"
            });
            return;
        }
        const avBool = await alreadyValidated(prn);
        if (avBool) {
            res.status(403).json({
                message: "You're already validated. The server allows only one account per PRN. No alts allowed",
            });
            return;
        }
        else {
            res.status(200).json({
                message: "OK"
            });
            return
        }
    }
    else {
        res.status(405).json({
            message: "Method not allowed"
        });
    }
}

export default handler;