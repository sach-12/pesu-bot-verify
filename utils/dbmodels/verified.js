// Schema for verified collection on MongoDB

import pkg from "mongoose";
const  { Schema, model } = pkg;

const VerifiedSchema = new Schema(
    {
        Username: { type: String, required: true},
        ID: { type: String, required: true},
        PRN: { type: String, required: true}
    }
);

const verified = model('verified', VerifiedSchema, 'verified');

export default verified;