import connectToDb from "../../utils/database";
import {getBotClient} from "../../utils/discordClient";
import {runCors, runLimiter} from "../../utils/middleware";

let ready = false

// This API is used to establish a connections with MongoDB and Discord.
const handler = async (req, res) => {
    // Middleware
    await runCors(req, res, "GET");
    // await runLimiter(req, res);

    // Reject any request that is not a GET
    if(req.method === "GET") {
        if(!ready){
            // Connect to MongoDB
            await connectToDb();

            // Connect to Discord
            await getBotClient();

            ready = true;
            res.status(200).json({
                message: "Initialized"
            });
            return;
        }
        else {
            res.status(200).json({
                message: "Initialized"
            })
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

export default handler;