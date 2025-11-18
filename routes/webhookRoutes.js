/*-----------------------------------------------------------------------------------------------------
| @blocktype webhookRoutes
| @brief    Defines webhook endpoints for payment notifications from Fapshi
| @param    Express app instance
| @return   --
-----------------------------------------------------------------------------------------------------*/

import express from "express";
import { handlePaymentWebhook } from "../controllers/webhookController.js";

const router = express.Router();

router.post("/payment", handlePaymentWebhook);

export default router;
