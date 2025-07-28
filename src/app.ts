import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db";
import walletRoute from "./routes/walletRoute";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();
app.set("trust proxy", 1);
app.use(morgan("dev"));
app.use(cors());
app.use(helmet());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to Coconut Wallet Service API");
});

// Wallet routes
app.use("/api/v1/wallets", walletRoute);

// Error handler
app.use(errorHandler);

connectDB();

export default app;
