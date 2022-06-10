import batch from "./dbmodels/batchDetails";

const getBatchDetails = async (PRN) => {
    const batchDetails = await batch.findOne({ PRN: PRN });
    return batchDetails;
}

export default getBatchDetails;