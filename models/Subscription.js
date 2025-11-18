/*-----------------------------------------------------------------------------------------------------
| @blocktype Subscription
| @brief    Mongoose model for tracking user subscriptions and premium status
| @param    User ID, subscription type, plan details, payment tracking
| @return   --
-----------------------------------------------------------------------------------------------------*/

import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    subscriptionType: {
      type: String,
      enum: ["free", "monthly", "quarterly", "yearly"],
      default: "free",
    },
    status: {
      type: String,
      enum: ["active", "pending", "expired", "cancelled"],
      default: "pending",
    },
    price: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "XAF",
    },
    startDate: {
      type: Date,
      default: null,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    renewalDate: {
      type: Date,
      default: null,
    },
    fapshiTransactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
