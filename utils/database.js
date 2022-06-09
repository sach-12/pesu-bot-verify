// The below three imports are unused but they create the models on importing
import anonban from "./dbmodels/anonban";
import batchDetails from "./dbmodels/batchDetails";
import verified from "./dbmodels/verified";

import { connect, connection } from "mongoose";

let connectionEstablished = null;

// Singleton method to get database connection
const connectToDb = async() => {
    if(connectionEstablished === null) {
        await connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        connectionEstablished = connection;
    }
    return connectionEstablished;
};

export default connectToDb;