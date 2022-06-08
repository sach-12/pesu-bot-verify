import { getUserClientId } from "../../utils/discordMember";

// This API is used to retrive the user's client ID with the user's access token

const handler = async (req, res) => {
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
        res.status(200).json({
            message: "OK",
            userId: userId
        });
        return;
    } else {
        res.status(405).json({
            message: "Method not allowed"
        });
        return;
    }
}