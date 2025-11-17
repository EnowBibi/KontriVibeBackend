import dotenv from "dotenv";
import connectToDB from "./config/db.js";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

const PORT = 3000;

connectToDB().then(() => {
  app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
  });
});

app.use("/api/ai", aiRoutes);
