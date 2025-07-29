import mongoose from "mongoose";

const AnonBanSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
    },
    bannedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "anonban",
  }
);

// Index for efficient queries
AnonBanSchema.index({ userId: 1, active: 1 });

const AnonBan =
  mongoose.connection?.models?.AnonBan ||
  mongoose.model("AnonBan", AnonBanSchema);

export default AnonBan;
