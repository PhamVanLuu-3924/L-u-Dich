import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import job from "./lib/cron.js";

import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import { connectDB } from "./lib/db.js";
//
import userRoutes from "./routes/userRoutes.js";

//

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Start cron job
job.start();
//
app.use("/api/users", userRoutes);

//

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

// Start server after DB is connected
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
