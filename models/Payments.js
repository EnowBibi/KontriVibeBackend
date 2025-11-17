import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    paymentId: { type: String, required: true },
    amount: Number,
    currency: String,

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },

    method: String,
    expiresAt: Date,

    rawData: Object,
  },
  { timestamps: true }
);

export default mongoose.model("Payment", PaymentSchema);
