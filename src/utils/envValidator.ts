import { z } from "zod";

const envSchema = z.object({
  WALLET_PORT: z.string().default("5001"),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  ADMIN_JWT_SECRET: z.string().min(1, "ADMIN_JWT_SECRET is required"),

  // Flutterwave
  FLUTTERWAVE_BASE_URL: z.string().min(1, "FLUTTERWAVE_BASE_URL is required"),
  FLUTTERWAVE_SECRET_KEY: z
    .string()
    .min(1, "FLUTTERWAVE_SECRET_KEY is required"),

  // Wallets ids
  BANKING_WALLET_ID: z.string().min(1, "BANKING_WALLET_ID is required"),
  SHIPPING_WALLET_ID: z.string().min(1, "SHIPPING_WALLET_ID is required"),
  FILLING_WALLET_ID: z.string().min(1, "FILLING_WALLET_ID is required"),
  PACKAGING_WALLET_ID: z.string().min(1, "PACKAGING_WALLET_ID is required"),
  TRANSFER_WALLET_ID: z.string().min(1, "TRANSFER_WALLET_ID is required"),

  //Bani
  BANI_BASE_URL: z.string().min(1, "BANI_BASE_URL is required"),
  BANI_TOKEN: z.string().min(1, "BANI_TOKEN is required"),
  BANI_MONI_SIGNATURE: z.string().min(1, "BANI_MONI_SIGNATURE is required"),
  BANI_SHARED_KEY: z.string().min(1, "BANI_MONI_SIGNATURE is required"),
});

export const env = envSchema.parse(process.env);
