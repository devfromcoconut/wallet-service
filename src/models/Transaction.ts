import { Schema, model, Document, Types } from "mongoose";

export interface TransactionDocument extends Document {
  walletId: Types.ObjectId; // Reference to Wallet model
  txId: string;
  txRef: string;
  shipmentId?: Types.ObjectId; // Optional reference to Shipment model
  amount: number;
  currency: string;
  type: "funding" | "payment"; // Type of transaction
  status: "pending" | "successful" | "failed"; // Transaction status
  meta: Record<string, any>; // Flexible key-value object
  paymentGatewayResponse?: any; // Store response from Seerbit
}

const TransactionSchema = new Schema<TransactionDocument>(
  {
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet", required: true }, // Reference to Wallet collection
    txId: { type: String, required: true, unique: true },
    txRef: { type: String, required: true, unique: true },
    shipmentId: {
      type: Schema.Types.ObjectId,
      ref: "Shipment",
      required: false,
    }, // Optional reference to Shipment collection
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    type: {
      type: String,
      enum: ["funding", "payment", "withdrawal"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "successful",  "failed"],
      default: "pending",
    },
    meta: {
      type: Map, // Allows any key-value pair structure
      of: Schema.Types.Mixed, // Supports any value type
      required: true,
    },
    paymentGatewayResponse: { type: Schema.Types.Mixed, required: false }, // Store Seerbit response
  },
  { timestamps: true }
);

export const Transaction = model<TransactionDocument>(
  "Transaction",
  TransactionSchema
);
