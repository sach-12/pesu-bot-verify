// Schema for anonban collection on MongoDB
import pkg from "mongoose";
const  { Schema, model } = pkg;

const AnonBanSchema = new Schema(
    {
        ID: { type: String, required: true},
        Reason: {type: String, required: true}
    }
);

const anonban = model('anonban', AnonBanSchema, 'anonban');

export default anonban;