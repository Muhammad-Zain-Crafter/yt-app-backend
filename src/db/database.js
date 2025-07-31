import mongoose from "mongoose";


const db_name = 'advance_backend_project';
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${db_name}`);
        console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.error("Error connecting to the database:", error);
        process.exit(1); // Exit the process with failure
    }
};

export default connectDB;
