import getBatchDetails from "../../utils/batchDetails";
import { getUserClientId } from "../../utils/discordMember";

const handler = async (req, res) => {
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
        const batchDetails = await getBatchDetails(prn);
        if (!batchDetails) {
            res.status(404).json({
                message: "Given PRN not found. Try again",
            });
            return;
        }
        else {
            if (prn.toString().charAt(7) === "8") {
                res.status(200).json({
                    message: "OK",
                    section: batchDetails.Section.charAt(batchDetails.Section.length - 1)
                });
                return;
            }
            else {
                res.status(200).json({
                    message: "OK",
                    srn: batchDetails.SRN,
                });
                return
            }
        }
    }
    else {
        res.status(405).json({
            message: "Method not allowed"
        });
        return;
    }
};

export default handler;