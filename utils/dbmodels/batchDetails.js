// Schema for batch details collection on MongoDB

// Note: Future updates will remove multiple batch details collections and instead use a single collection.
// A secondary index on PRN will be made for faster retrieval.

import pkg from "mongoose";
const  { Schema, model } = pkg;

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

const batch_2018 = model('batch_2018', BatchSchema, 'batch_2018');
const batch_2019 = model('batch_2019', BatchSchema, 'batch_2019');
const batch_2020 = model('batch_2020', BatchSchema, 'batch_2020');
const batch_2021 = model('batch_2021', BatchSchema, 'batch_2021');

export default {
    batch_2018,
    batch_2019,
    batch_2020,
    batch_2021
}