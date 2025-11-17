/*-----------------------------------------------------------------------------------------------------
| @blocktype notificationRoutes
| @brief    Defines all notification-related API endpoints for fetching, managing, and push tokens
| @param    Express app instance
| @return   --
-----------------------------------------------------------------------------------------------------*/

import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  registerPushToken,
  unregisterPushToken,
  deleteNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

// Notification endpoints
router.get("/", authenticate, getNotifications);

router.put("/:notificationId/read", authenticate, markNotificationAsRead);

router.put("/read-all", authenticate, markAllNotificationsAsRead);

router.delete("/:notificationId", authenticate, deleteNotification);

// Push token endpoints
router.post("/push-token/register", authenticate, registerPushToken);

router.post("/push-token/unregister", authenticate, unregisterPushToken);

export default router;
