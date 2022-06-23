import alreadyValidated from "../../utils/alreadyValidated";
import { getUserClientId } from "../../utils/discordMember";
import getBatchDetails from "../../utils/batchDetails";
import roleAlreadyExists from "../../utils/roleAlreadyExists";
import newValidate from "../../utils/newValidate";
import { runCors, runLimiter, runUserIdLimiter } from "../../utils/middleware";

const handler = async (req, res) => {
    // Middleware
    await runCors(req, res, "POST");
    // await runLimiter(req, res);
    await runUserIdLimiter(req, res);
    

    // Reject any request that is not a POST
    if (req.method === "POST") {
        const userToken = req.body.userToken;
        const prn = req.body.prn;

        const srn = req.body.srn;
        const section = req.body.section;

        if (!prn || !userToken) {
            res.status(400).json({
                message: "Missing body parameter: prn or userToken"
            });
            return;
        }

        // Discord Auth
        const userClientId = await getUserClientId(userToken);
        if (!userClientId) {
            res.status(401).json({
                message: "Invalid user token"
            });
            return;
        }

        // Check if user has already validated role
        const roleExists = await roleAlreadyExists(userClientId);
        if (roleExists) {
            res.status(403).json({
                message: "You're already validated. Are you trying to steal someone's identity, you naughty little...",
            });
            return;
        }

        // Check if user's PRN is already validated
        const avBool = await alreadyValidated(prn);
        if (avBool) {
            res.status(403).json({
                message: "You're already validated. The server allows only one account per PRN. No alts allowed.",
            });
            return;
        }

        // Check if PRN exists
        const batchDetails = await getBatchDetails(prn);
        if (!batchDetails) {
            res.status(404).json({
                message: "Given PRN not found. Try again",
            });
            return;
        }
        else {
            if (prn.toString().toUpperCase().charAt(7) === "8") {
                if (batchDetails.Section.charAt(batchDetails.Section.length - 1) === section.toUpperCase()) {
                    // All functions needed to validate user like role adding, database entry, etc.
                    const response = await newValidate(userClientId, prn);
                    if (response) {
                        res.status(200).json({
                            message: "OK",
                            section: batchDetails.Section,
                            branch: batchDetails.Branch,
                        });
                        return;
                    }
                    else {
                        res.status(500).json({
                            message: "Internal server error",
                        });
                        return;
                    }
                }
                else {
                    res.status(403).json({
                        message: "Section did not match the corresponding PRN. Try again",
                    });
                    return;
                }
            }
            else {
                if (batchDetails.SRN === srn.toUpperCase()) {
                    const response = await newValidate(userClientId, prn);
                    if (response) {
                        res.status(200).json({
                            message: "OK",
                            section: batchDetails.Section,
                            branch: batchDetails.Branch,
                        });
                        return;
                    }
                    else {
                        res.status(500).json({
                            message: "Internal server error",
                        });
                        return;
                    }
                }
                else {
                    res.status(403).json({
                        message: "SRN did not match the corresponding PRN. Try again",
                    });
                    return;
                }
            }
        }
    }
    else {
        res.status(405).json({
            message: "Method not allowed"
        });
    }
}

export default handler;