import mongoose from "mongoose";
import { env } from "../utils/envValidator";

const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI!);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("DB Connection Error:", error);
    process.exit(1);
  }
};

export default connectDB;
