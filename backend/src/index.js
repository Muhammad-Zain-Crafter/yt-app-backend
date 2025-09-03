import dotenv from "dotenv";
dotenv.config();

import connectDB from "./db/database.js";
import app from "./app.js";



connectDB() // return a promise (async function)
.then(() => {
  app.listen(process.env.PORT || 8000, () => {
    console.log("server is running on port", process.env.PORT || 8000);
  })
})
.catch((err) => {
  console.log("Mongo db connection failed", err);
})

