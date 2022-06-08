// Schema for verified collection on MongoDB

import { Schema, model } from "mongoose";

const VerifiedSchema = new Schema(
    {
        Username: { type: String, required: true},
        ID: { type: String, required: true},
        PRN: { type: String, required: true}
    }
);

const verified = model('verified', VerifiedSchema, 'verified');

export default verified;