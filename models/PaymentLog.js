/*-----------------------------------------------------------------------------------------------------
| @blocktype PaymentLog
| @brief    Mongoose model for tracking all payment transactions and security audit logs
| @param    Transaction details, payment status, security checksums
| @return   --
-----------------------------------------------------------------------------------------------------*/

import mongoose from "mongoose";

const paymentLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fapshiTransId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fapshiFinancialTransId: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "XAF",
    },
    paymentMethod: {
      type: String,
      enum: ["mobile_money", "orange_money", "direct_pay", "redirect_pay"],
      default: null,
    },
    subscriptionType: {
      type: String,
      enum: ["monthly", "quarterly", "yearly"],
      required: true,
    },
    status: {
      type: String,
      enum: ["created", "successful", "failed", "expired", "pending"],
      default: "pending",
    },
    payerName: {
      type: String,
      default: null,
    },
    payerPhone: {
      type: String,
      default: null,
    },
    payerEmail: {
      type: String,
      default: null,
    },
    initiatedAt: {
      type: Date,
      default: Date.now,
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    securityChecksum: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const PaymentLog = mongoose.model("PaymentLog", paymentLogSchema);

export default PaymentLog;
