import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import { env } from "./utils/envValidator";

const PORT = env.WALLET_PORT || 5001; // Different port for wallet service

app.listen(PORT, () => {
  console.log(`Wallet Service running on port ${PORT}`);
  console.log(`Wallet API available at http://localhost:${PORT}/api/v1/wallets`);
});
