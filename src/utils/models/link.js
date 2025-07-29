import mongoose from "mongoose";

const LinkSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    prn: {
      type: String,
      required: true,
      index: true,
    },
    linkedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "link",
  }
);

// Compound index for efficient queries
LinkSchema.index({ userId: 1, prn: 1 }, { unique: true });

// Static methods for querying
LinkSchema.statics.prnExists = async function (prn) {
  return await this.exists({ prn: prn });
};

LinkSchema.statics.createLinkRecord = async function (userId, prn) {
  const link = new this({
    userId: userId,
    prn: prn,
    linkedAt: new Date(),
  });
  return await link.save();
};

const Link =
  mongoose.connection?.models?.Link || mongoose.model("Link", LinkSchema);

export default Link;
