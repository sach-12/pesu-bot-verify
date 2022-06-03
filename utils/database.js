import mongoose from "mongoose";

let connection = null;

// Singleton method to get database connection
const connect = (() => {
    if(connection === null) {
        mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        connection = mongoose.connection;
    }
    return connection;
});

export default connect;