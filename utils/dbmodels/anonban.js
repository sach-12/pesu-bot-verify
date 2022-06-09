// Schema for anonban collection on MongoDB

import { Schema, model, connection } from "mongoose";

const AnonBanSchema = new Schema(
    {
        ID: { type: String, required: true},
        Reason: {type: String, required: true}
    }
);

let anonban = connection.models.anonban;
if(!anonban) {
    anonban = model("anonban", AnonBanSchema, "anonban");
}

export default anonban;