import connect from "./database.js";
import verified from "./dbmodels/verified.js";

// This function checks if the user's PRN is already on the verified collection in MongoDB
const alreadyValidated = async(PRN) => {
    connect();

    const member = await verified.findOne({
        PRN: PRN
    });
    if(member === null) {
        return false;
    }
    return true;
};

export default alreadyValidated;