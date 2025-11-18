/*-----------------------------------------------------------------------------------------------------
| @blocktype subscriptionMiddleware
| @brief    Middleware to check user subscription status and premium access
| @param    req, res, next
| @return   Attaches premium status to request or returns 403
-----------------------------------------------------------------------------------------------------*/

import User from "../models/User.js";

/**
 * @brief Check if user has active premium subscription
 */
export async function checkPremiumSubscription(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const now = new Date();
    const isPremiumActive =
      user.isPremium && user.premiumExpiresAt && user.premiumExpiresAt > now;

    if (!isPremiumActive) {
      return res.status(403).json({
        error: "Premium subscription required",
        message: "This feature is only available for premium users",
        upgradePath: "/subscribe",
      });
    }

    req.userPremium = {
      isPremium: true,
      expiresAt: user.premiumExpiresAt,
    };

    next();
  } catch (error) {
    console.error("[v0] Subscription check error:", error);
    return res.status(500).json({
      error: "Failed to verify subscription",
      message: error.message || "An unexpected error occurred",
    });
  }
}

/**
 * @brief Attach subscription info to request (non-blocking)
 */
export async function attachSubscriptionInfo(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next();
    }

    const user = await User.findById(userId).select(
      "isPremium premiumExpiresAt"
    );
    if (!user) {
      return next();
    }

    const now = new Date();
    const isPremiumActive =
      user.isPremium && user.premiumExpiresAt && user.premiumExpiresAt > now;

    req.subscription = {
      isPremium: isPremiumActive,
      expiresAt: user.premiumExpiresAt,
      daysRemaining: isPremiumActive
        ? Math.ceil((user.premiumExpiresAt - now) / (1000 * 60 * 60 * 24))
        : 0,
    };

    next();
  } catch (error) {
    console.error("[v0] Attach subscription error:", error);
    next();
  }
}
