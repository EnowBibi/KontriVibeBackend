/*-----------------------------------------------------------------------------------------------------
| @blocktype webhookController
| @brief    Handles Fapshi webhook notifications for payment confirmations
| @param    Express request and response objects
| @return   HTTP 200 to acknowledge receipt, updates payment status
-----------------------------------------------------------------------------------------------------*/

import PaymentLog from "../models/PaymentLog.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";

/**
 * @brief Handle Fapshi webhook for payment status updates
 * @param req.body - Webhook payload with transaction details
 * @return HTTP 200 acknowledgement
 */
export async function handlePaymentWebhook(req, res) {
  try {
    console.log("[v0] Webhook received:", req.body);

    const {
      transId,
      status,
      amount,
      payerName,
      email,
      financialTransId,
      dateConfirmed,
    } = req.body || {};

    const paymentMethod =
      req.body.medium === "mobile money" ? "mobile_money" : "orange_money";

    if (!transId) {
      console.error("[v0] Webhook received without transaction ID");
      return res
        .status(400)
        .json({ success: false, message: "Missing transaction ID" });
    }

    console.log(
      `[v0] Processing webhook for transaction ${transId} with status ${status}`
    );

    const paymentLog = await PaymentLog.findOne({ fapshiTransId: transId });

    if (!paymentLog) {
      console.warn(`[v0] Payment log not found for transaction: ${transId}`);
      return res
        .status(200)
        .json({ success: false, message: "Payment not found" });
    }

    let newStatus;
    switch (status?.toUpperCase()) {
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
      paymentLog.paymentMethod = paymentMethod || paymentLog.paymentMethod;
      paymentLog.confirmedAt =
        newStatus === "successful"
          ? new Date(dateConfirmed || Date.now())
          : null;
      paymentLog.fapshiFinancialTransId =
        financialTransId || paymentLog.fapshiFinancialTransId;
      await paymentLog.save();

      console.log(`[v0] Payment log ${transId} updated to ${newStatus}`);
    }

    if (newStatus === "successful") {
      const subscription = await Subscription.findOne({
        fapshiTransactionId: transId,
      });

      if (subscription && subscription.status === "pending") {
        const PLANS = {
          monthly: 30,
          quarterly: 90,
          yearly: 365,
        };

        const days = PLANS[subscription.subscriptionType] || 30;
        const now = new Date();
        const expiryDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

        subscription.status = "active";
        subscription.startDate = now;
        subscription.expiryDate = expiryDate;
        subscription.renewalDate = expiryDate;
        await subscription.save();

        const user = await User.findById(subscription.userId);
        if (user) {
          user.isPremium = true;
          user.premiumExpiresAt = expiryDate;
          await user.save();
        }

        console.log(
          `[v0] Subscription ${subscription._id} activated for user ${subscription.userId}`
        );
      }
    }

    return res
      .status(200)
      .json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("[v0] Error processing webhook:", error);
    return res
      .status(200)
      .json({ success: false, message: "Error processing webhook" });
  }
}
