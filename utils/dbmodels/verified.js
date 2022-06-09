// Schema for verified collection on MongoDB

import { Schema, model, connection } from "mongoose";

const VerifiedSchema = new Schema(
    {
        Username: { type: String, required: true},
        ID: { type: String, required: true},
        PRN: { type: String, required: true}
    }
);

let verified = connection.models.verified;
if(!verified) {
    verified = model("verified", VerifiedSchema, "verified");
}

export default verified;