// index.js
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./db/database.js";
import app from "./app.js";

// Connect to MongoDB Atlas
connectDB()
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection failed", err));

// ❌ Don't use app.listen()
// ✅ Export app for Vercel
export default app;
