/*-----------------------------------------------------------------------------------------------------
| @blocktype subscriptionRoutes
| @brief    Defines all subscription and payment API endpoints
| @param    Express app instance
| @return   --
-----------------------------------------------------------------------------------------------------*/

import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  createSubscription,
  verifyPayment,
  getSubscriptionStatus,
  cancelSubscription,
} from "../controllers/subscriptionController.js";

const router = express.Router();

router.post("/create", authenticate, createSubscription);

router.post("/verify", authenticate, verifyPayment);

router.get("/status", authenticate, getSubscriptionStatus);

router.post("/cancel", authenticate, cancelSubscription);

export default router;
