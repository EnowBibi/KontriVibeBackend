/*-----------------------------------------------------------------------------------------------------
| @blocktype subscriptionController
| @brief    Handles subscription creation, payment, and verification operations
| @param    Express request and response objects
| @return   JSON responses with subscription/payment details or error messages
-----------------------------------------------------------------------------------------------------*/

import Subscription from "../models/Subscription.js";
import PaymentLog from "../models/PaymentLog.js";
import User from "../models/User.js";
import * as fapshi from "../utils/fapshiClient.js";
import crypto from "crypto";

const SUBSCRIPTION_PLANS = {
  monthly: { price: 2500, days: 30 },
  quarterly: { price: 6500, days: 90 },
  yearly: { price: 20000, days: 365 },
};

/**
 * @brief Create security checksum for payment verification
 * @param data - Payment data to checksum
 * @return SHA256 hash
 */
function generateChecksum(data) {
  const jsonString = JSON.stringify(data);
  return crypto.createHash("sha256").update(jsonString).digest("hex");
}

/**
 * @brief Create subscription and initiate payment
 * @param req.body.subscriptionType - 'monthly', 'quarterly', or 'yearly'
 * @param req.body.paymentMethod - 'redirect' or 'direct'
 * @param req.body.phone - Required for direct payment
 * @return Subscription created with payment link or transaction ID
 */
export async function createSubscription(req, res) {
  try {
    const { subscriptionType, paymentMethod, phone, redirectUrl } = req.body;
    const userId = req.user.id;

    if (!subscriptionType || !SUBSCRIPTION_PLANS[subscriptionType]) {
      return res.status(400).json({
        error: "Invalid subscription type",
        validTypes: Object.keys(SUBSCRIPTION_PLANS),
      });
    }

    if (!paymentMethod || !["redirect", "direct"].includes(paymentMethod)) {
      return res.status(400).json({
        error: 'Invalid payment method. Use "redirect" or "direct"',
      });
    }

    // Fetch user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingSubscription = await Subscription.findOne({
      userId,
      status: { $in: ["active", "pending"] },
    });

    if (existingSubscription) {
      return res.status(409).json({
        error: "Active subscription exists",
        message:
          "You already have an active subscription. Cancel it to create a new one.",
        currentSubscription: existingSubscription.subscriptionType,
      });
    }

    const plan = SUBSCRIPTION_PLANS[subscriptionType];

    // Create subscription record
    const subscription = new Subscription({
      userId,
      subscriptionType,
      status: "pending",
      price: plan.price,
      autoRenew: true,
    });

    const paymentData = {
      userId: userId.toString(),
      amount: plan.price,
      subscriptionType,
      timestamp: new Date().toISOString(),
    };

    const securityChecksum = generateChecksum(paymentData);

    const paymentLog = new PaymentLog({
      userId,
      amount: plan.price,
      subscriptionType,
      status: "created",
      paymentMethod,
      securityChecksum,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    let paymentResult;

    if (paymentMethod === "redirect") {
      if (!redirectUrl) {
        return res.status(400).json({
          error: "redirectUrl required for redirect payment",
        });
      }

      paymentResult = await fapshi.initiatePay({
        amount: plan.price,
        email: user.email,
        userId: userId.toString(),
        externalId: subscription._id.toString(),
        redirectUrl,
        message: `KontriVibe ${subscriptionType} subscription`,
      });
    } else if (paymentMethod === "direct") {
      if (!phone) {
        return res.status(400).json({
          error: "Phone number required for direct payment",
        });
      }

      paymentResult = await fapshi.directPay({
        amount: plan.price,
        phone,
        name: user.fullName,
        email: user.email,
        userId: userId.toString(),
        externalId: subscription._id.toString(),
        message: `KontriVibe ${subscriptionType} subscription`,
      });
    }

    if (!paymentResult.success) {
      paymentLog.status = "failed";
      paymentLog.errorMessage = paymentResult.message;
      await paymentLog.save();

      return res.status(400).json({
        error: "Payment initiation failed",
        message: paymentResult.message,
      });
    }

    paymentLog.fapshiTransId = paymentResult.transId;
    paymentLog.status = "created";
    paymentLog.expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry

    await paymentLog.save();

    subscription.fapshiTransactionId = paymentResult.transId;
    await subscription.save();

    return res.status(201).json({
      success: true,
      subscription: {
        id: subscription._id,
        type: subscriptionType,
        amount: plan.price,
        duration: `${plan.days} days`,
        status: "pending",
      },
      payment: {
        transactionId: paymentResult.transId,
        paymentLink: paymentResult.paymentLink || null,
        expiresIn: "15 minutes",
      },
    });
  } catch (error) {
    console.error("[v0] Create subscription error:", error);
    return res.status(500).json({
      error: "Failed to create subscription",
      message: error.message || "An unexpected error occurred",
    });
  }
}

/**
 * @brief Verify payment and activate subscription
 * @param req.body.transactionId - Fapshi transaction ID
 * @return Updated subscription with activation confirmation
 */
export async function verifyPayment(req, res) {
  try {
    const { transactionId } = req.body;
    const userId = req.user.id;

    if (!transactionId) {
      return res.status(400).json({ error: "Transaction ID required" });
    }

    const paymentLog = await PaymentLog.findOne({
      fapshiTransId: transactionId,
      userId,
    });

    if (!paymentLog) {
      return res.status(404).json({
        error: "Payment not found",
        message: "Transaction not associated with your account",
      });
    }

    const statusResult = await fapshi.paymentStatus(transactionId);

    if (!statusResult.success) {
      return res.status(400).json({
        error: "Failed to verify payment",
        message: statusResult.message,
      });
    }

    const fapshiStatus = statusResult.status?.toUpperCase();
    let newStatus;

    switch (fapshiStatus) {
      case "SUCCESSFUL":
        newStatus = "successful";
        break;
      case "FAILED":
        newStatus = "failed";
        break;
      case "EXPIRED":
        newStatus = "expired";
        break;
      default:
        newStatus = "pending";
    }

    if (paymentLog.status !== newStatus) {
      paymentLog.status = newStatus;
      paymentLog.confirmedAt =
        newStatus === "successful"
          ? new Date(statusResult.dateConfirmed || Date.now())
          : null;
      paymentLog.fapshiFinancialTransId = statusResult.financialTransId || null;
      paymentLog.paymentMethod =
        statusResult.medium === "mobile money"
          ? "mobile_money"
          : "orange_money";
      await paymentLog.save();
    }

    if (newStatus !== "successful") {
      return res.status(400).json({
        error: "Payment not successful",
        status: newStatus,
        message:
          newStatus === "expired"
            ? "Payment link has expired"
            : "Payment is still pending or has failed",
      });
    }

    const subscription = await Subscription.findOne({
      fapshiTransactionId: transactionId,
    });

    if (!subscription) {
      return res.status(404).json({
        error: "Subscription not found",
      });
    }

    const plan = SUBSCRIPTION_PLANS[subscription.subscriptionType];
    const now = new Date();
    const expiryDate = new Date(
      now.getTime() + plan.days * 24 * 60 * 60 * 1000
    );

    subscription.status = "active";
    subscription.startDate = now;
    subscription.expiryDate = expiryDate;
    subscription.renewalDate = expiryDate;
    await subscription.save();

    const user = await User.findById(userId);
    user.isPremium = true;
    user.premiumExpiresAt = expiryDate;
    await user.save();

    return res.status(200).json({
      success: true,
      subscription: {
        id: subscription._id,
        type: subscription.subscriptionType,
        status: "active",
        startDate: subscription.startDate,
        expiryDate: subscription.expiryDate,
      },
      message: "Subscription activated successfully!",
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({
      error: "Failed to verify payment",
      message: error.message || "An unexpected error occurred",
    });
  }
}

/**
 * @brief Get user's current subscription details
 * @return Current subscription and premium status
 */
export async function getSubscriptionStatus(req, res) {
  try {
    const userId = req.user.id;

    const subscription = await Subscription.findOne({ userId });
    const user = await User.findById(userId).select(
      "isPremium premiumExpiresAt"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const now = new Date();
    const isPremiumActive =
      user.isPremium && user.premiumExpiresAt && user.premiumExpiresAt > now;

    let response = {
      success: true,
      isPremium: isPremiumActive,
      subscription: null,
    };

    if (subscription && isPremiumActive) {
      const daysRemaining = Math.ceil(
        (user.premiumExpiresAt - now) / (1000 * 60 * 60 * 24)
      );

      response.subscription = {
        id: subscription._id,
        type: subscription.subscriptionType,
        status: subscription.status,
        startDate: subscription.startDate,
        expiryDate: subscription.expiryDate,
        renewalDate: subscription.renewalDate,
        daysRemaining,
        autoRenew: subscription.autoRenew,
      };
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error(" Get subscription status error:", error);
    return res.status(500).json({
      error: "Failed to fetch subscription status",
      message: error.message || "An unexpected error occurred",
    });
  }
}

/**
 * @brief Cancel active subscription
 * @param req.body.reason - Optional cancellation reason
 * @return Cancellation confirmation
 */
export async function cancelSubscription(req, res) {
  try {
    const { reason } = req.body;
    const userId = req.user.id;

    const subscription = await Subscription.findOne({ userId });

    if (!subscription || subscription.status !== "active") {
      return res.status(400).json({
        error: "No active subscription to cancel",
      });
    }

    subscription.status = "cancelled";
    subscription.cancellationReason = reason || "User requested cancellation";
    subscription.cancelledAt = new Date();
    subscription.autoRenew = false;
    await subscription.save();

    const user = await User.findById(userId);
    user.isPremium = false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
      cancelledAt: subscription.cancelledAt,
    });
  } catch (error) {
    console.error(" Cancel subscription error:", error);
    return res.status(500).json({
      error: "Failed to cancel subscription",
      message: error.message || "An unexpected error occurred",
    });
  }
}
