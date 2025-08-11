import { z } from "zod";

type Address = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
};

type BackgroundDocument = {
  file: File;
  issueDate: string;
  expiryDate: string;
};

export type KycMapped = {
  name_first: string;
  name_last: string;
  name_other: string;
  phone: string;
  email: string;
  dob: string;
  id_level?: string;
  id_type?: string;
  id_number: string;
  id_country: string;
  bank_id_number?: string;
  kyc_level?: string;
  address: Address;
  background_information?: {
    documents?: BackgroundDocument[];
  };
};


export type KycStateFlat = {
  firstName: string;
  lastName: string;
  email: string;
  otherName: string;
  phoneNumber: string;
  dateOfBirth: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  country: string;
  typeId: string;
  issueDate: string;
  expiryDate: string;
  issuingCountry: string;
  bvnNumber: string;
  identificationNumber: string;
  identificationFile: string;
  postalCode: string; // Optional field for postal code
};

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

export const kycSchema = z.object({
  // Personal Details
  firstName: z.string(),
  lastName: z.string(),
  otherName: z.string(),
  phoneNumber: z.string(),
  dateOfBirth: z.string(), // Consider refining to z.coerce.date() if using real dates
  address1: z.string(),
  address2: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),

  // Identification
  typeId: z.string(),
  issueDate: z.string(), // Same: you might want to validate date format
  expiryDate: z.string(),
  issuingCountry: z.string(),
  bvnNumber: z.string(),
  identificationNumber: z.string(),
  identificationFile: z.string(), // matches File | null
  postalCode: z.string(), // Optional postal code
});
