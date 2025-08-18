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













// async function connectDB() {
//     try {
//         await mongoose.connect(`${process.env.MONGO_DB_URI}/${db_name}`)
//         application.on('error', (err) => {
//             console.error("Database connection error:", err);
//         })
//         application.listen(process.env.PORT || 8000, () => {
//             console.log(`Server is running on port ${process.env.PORT}`);
//         })
//     }
//     catch (error) {
//         console.error("Error connecting to the database:", error);
//         process.exit(1); // Exit the process with failure
//     }
//}