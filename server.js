import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectToDB from "./config/db.js";
import aiRoutes from "./routes/aiRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Allow all origins for now (you can restrict later)
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// Connect DB + Start Server
connectToDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(` Server running on http://0.0.0.0:${PORT}`);
  });
});
// Routes
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/notifications", notificationRoutes);
