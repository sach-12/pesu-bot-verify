import "./models/anonban.js";
import "./models/batchDetails.js";
import "./models/verified.js";
import { connect as c, connection } from "mongoose";

let connectionEstablished = null;

// Singleton method to get database connection
const connect = async () => {
	if (connectionEstablished === null) {
		await c(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		connectionEstablished = connection;
	}
	return connectionEstablished;
};

export default connect;
