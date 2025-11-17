import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectToDB from "./config/db.js";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

const app = express();

const PORT = 3000;
app.use(express.json());

//allow connection from frontend
app.use(
  cors({
    origin: ["http://localhost:5173"], //put actual mobile device ip
    credentials: true,
  })
);
connectToDB().then(() => {
  app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
  });
});

app.use("/api/ai", aiRoutes);
