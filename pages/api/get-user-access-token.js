import {getUserAccessToken} from "../../utils/discordMember";

// This API is  used to retrieve user token access from the "Code" discord generates
// on successful authentication

const handler = async (req, res) => {
    // Reject any request that is not a POST
    if (req.method === "POST") {
        const code = req.body.code;
        const userToken = await getUserAccessToken(code);
        if (!userToken) {
            res.status(401).json({
                message: "Authentication failed"
            });
            return;
        }
        res.status(200).json({
            message: "OK",
            userToken: userToken
        });
        return;
    } else {
        res.status(405).json({
            message: "Method not allowed"
        });
        return;
    }
}

export default handler;