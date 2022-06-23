import { getUserClientId } from "../../utils/discordMember";
import reportError from "../../utils/reportError";
import { runCors, runLimiter, runUserIdLimiter } from "../../utils/middleware";

const handler = async (req, res) => {
    // Middleware
    await runCors(req, res, "POST");
    // await runLimiter(req, res);
    await runUserIdLimiter(req, res);

    // Reject any request that is not a POST
    if (req.method === "POST") {
        const userToken = req.body.userToken;
        const errorType = req.body.errorType;
        const errorMessage = req.body.errorMessage;

        if (!errorType || !errorMessage) {
            res.status(400).json({
                message: "Missing body parameter: errorType or errorMessage"
            });
            return;
        }

        const userClientId = await getUserClientId(userToken);
        if (!userClientId) {
            res.status(401).json({
                message: "Authentication failed"
            });
            return;
        }

        const errorId = await reportError(userClientId, errorType, errorMessage);
        res.status(200).json({
            message: "OK",
            errorId: errorId
        })
    } else {
        res.status(405).json({
            message: "Method not allowed"
        });
        return;
    }
}

export default handler;