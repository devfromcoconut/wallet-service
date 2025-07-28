import { z } from "zod";

export const createWalletSchema = z.object({
  businessId: z.string().min(1, "Business ID is required"),
  email: z.string().min(1, "Email is required"),
  phoneNumber: z.string().min(1, "Phone is required"),
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  narration: z.string().min(1, "Narration is required"),
  bvn: z.string().min(1, "BVN is required"),
  currency: z.string().min(1, "Currency is required"),
});

export const transferToBankSchema = z.object({
  recipientAccountBank: z.string().min(1, "Recipient Account Bank is required"),
  recipientAccountNumber: z
    .string()
    .min(1, "Recipient Account Number is required"),
  amount: z.number().positive("Amount must be greater than zero"),
  narration: z.string().optional(),
});

export const updateBvnSchema = z.object({
  walletId: z.string().min(24, "Invalid wallet ID"),
  bvn: z.string().length(11, "BVN must be 11 digits"),
});

export const processPaymentSchema = z.object({
  walletId: z.string().min(1, "Wallet ID is required"),
  amount: z.array(z.number().nonnegative("Amount must be a positive number")),
  meta: z.record(z.any()),
  service: z.string().min(1, "Shipment ID is required"),
});

export const getTransactionsByWalletId = z.object({
  walletId: z.string().min(1, "Wallet ID is required"),
});
