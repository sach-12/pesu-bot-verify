// Schema for batch details collection on MongoDB

// Note: Future updates will remove multiple batch details collections and instead use a single collection.
// A secondary index on PRN will be made for faster retrieval.

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

let batch_2018 = connection.models.batch_2018;
if(!batch_2018) {
    batch_2018 = model("batch_2018", BatchSchema, "batch_2018");
}

let batch_2019 = connection.models.batch_2019;
if(!batch_2019) {
    batch_2019 = model("batch_2019", BatchSchema, "batch_2019");
}

let batch_2020 = connection.models.batch_2020;
if(!batch_2020) {
    batch_2020 = model("batch_2020", BatchSchema, "batch_2020");
}

let batch_2021 = connection.models.batch_2021;
if(!batch_2021) {
    batch_2021 = model("batch_2021", BatchSchema, "batch_2021");
}

// Future code:

// let batch = connection.models.batch;
// if(!batch) {
//     batch = model("batch", BatchSchema, "batch");
// }

export default {
    batch_2018,
    batch_2019,
    batch_2020,
    batch_2021
}