/*-----------------------------------------------------------------------------------------------------
| @blocktype firebaseAdmin
| @brief    Firebase Admin SDK initialization for sending push notifications to React Native clients
| @param    --
| @return   Firebase admin instance for push notification operations
-----------------------------------------------------------------------------------------------------*/

import admin from "firebase-admin";

// Initialize Firebase Admin SDK
const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const messaging = firebaseApp.messaging();

/**
 * @brief Send push notification to single device via FCM token
 * @param token - FCM token from React Native device
 * @param title - Notification title
 * @param message - Notification message
 * @param data - Optional additional data payload
 * @return FCM response or error
 */
export async function sendPushNotification(token, title, message, data = {}) {
  try {
    const payload = {
      notification: {
        title,
        body: message,
      },
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
      android: {
        priority: "high",
        notification: {
          sound: "default",
          clickAction: "FLUTTER_NOTIFICATION_CLICK",
        },
      },
      apns: {
        headers: {
          "apns-priority": "10",
        },
        payload: {
          aps: {
            alert: {
              title,
              body: message,
            },
            sound: "default",
            badge: 1,
          },
        },
      },
    };

    const response = await messaging.send(payload);
    return { success: true, messageId: response };
  } catch (error) {
    console.error("Push notification error:", error);
    throw error;
  }
}

/**
 * @brief Send notifications to multiple devices via topic subscription
 * @param topic - FCM topic name
 * @param title - Notification title
 * @param message - Notification message
 * @param data - Optional additional data
 * @return FCM response or error
 */
export async function sendTopicNotification(topic, title, message, data = {}) {
  try {
    const payload = {
      notification: {
        title,
        body: message,
      },
      data: {
        ...data,
        timestamp: new Date().toISOString(),
      },
      android: {
        priority: "high",
      },
    };

    const response = await messaging.sendToTopic(topic, payload);
    return { success: true, messageId: response };
  } catch (error) {
    console.error("Topic notification error:", error);
    throw error;
  }
}

export default messaging;
