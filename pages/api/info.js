import { cors, rateLimiter, userLimiter, auth } from "@/utils/middleware";
import connect from "@/utils/db.js";
import verified from "@/utils/models/verified.js";
import batch from "@/utils/models/batchDetails.js";

const handler = async (req, res) => {
	// Middleware
	await cors(req, res, ["GET"]);
	if (res.headersSent) return;
	await rateLimiter(req, res);
	if (res.headersSent) return;
	await userLimiter(req, res);
	if (res.headersSent) return;
	await auth(req, res);
	if (res.headersSent) return;

	const { prn, srn, id } = req.query;
	// at least one of them should be present
	if (!prn && !srn && !id) {
		return res.status(400).json({
			message: "Bad Request",
		});
	}

	// TODO
	if (srn || id) {
		return res.status(200).json({
			message: "Coming Soon",
		});
	}

	await connect();

	const batch_details = await batch.findOne({ PRN: prn });
	if (!batch_details) {
		return res.status(404).json({
			message: "PRN Not Found",
		});
	}

	const is_verified = await verified.exists({ PRN: prn });
	if (is_verified) {
		return res.status(403).json({
			message: "PRN already verified with another account.",
		});
	} else {
		const srn = batch_details.SRN;
		let requires = "srn";
		if (prn.toString().toLowerCase() === srn.toString().toLowerCase() || srn === "NA") {
			requires = "section";
		}

		return res.status(200).json({
			message: "Success",
			requires: requires,
		});
	}
};

export default handler;
