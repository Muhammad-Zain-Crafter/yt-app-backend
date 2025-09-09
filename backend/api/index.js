// api/index.js
import app from "../src/app.js";
import connectDB from "../src/db/database.js";

// MongoDB connect before handling requests
let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    await connectDB()
      .then(() => {
        console.log("✅ MongoDB connected on Vercel");
        isConnected = true;
      })
      .catch((err) => {
        console.error("❌ MongoDB connection failed", err);
        res.status(500).json({ error: "Database connection failed" });
        return;
      });
  }

  return app(req, res); // Pass request/response to Express app
}
