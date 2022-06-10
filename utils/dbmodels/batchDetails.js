// Schema for batch details collection on MongoDB

import { Schema, model, connection } from "mongoose";

const BatchSchema = new Schema(
    {
        PRN: { type: String, required: true},
        SRN: { type: String, required: true},
        Semester: { type: String, required: true},
        Section: { type: String, required: true},
        Cycle: { type: String, required: true},
        CandB: { type: String, required: true},
        Branch: { type: String, required: true},
        Campus: { type: String, required: true}
    }
)

let batch = connection.models.batch;
if(!batch) {
    batch = model("batch", BatchSchema, "batch");
}

export default batch