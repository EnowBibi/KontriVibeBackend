import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectToDB from "./config/db.js";
import aiRoutes from "./routes/aiRoutes.js";
import authRoutes from "./routes/authRoutes.js"
import songRoutes from "./routes/songRoutes.js";
import likeRoutes from "./routes/likeRoutes.js"
import commentRoutes from "./routes/commentRoutes.js"

dotenv.config();

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
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

// Routes
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentRoutes);