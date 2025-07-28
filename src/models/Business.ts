import mongoose, { Schema, Document } from "mongoose";

export interface IBusiness extends Document {
  userId: mongoose.Types.ObjectId; // Reference to the User model
  businessName: string;
  businessLogo: string;
  isRegistered: boolean;
  primary: boolean;
  businessCategory: string; 
  country: string;
  businessType: "Merchants" | "Corporates" | "Agents"; // Enum for business size
  primaryEmail: string;

  // wallets: mongoose.Schema.Types.ObjectId[];
}

const BusinessSchema = new Schema<IBusiness>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // Linking business to a user
    businessName: { type: String, required: true, },
    businessLogo: { type: String, required: false },
    isRegistered: { type: Boolean, default: false },
    primary: { type: Boolean, required: true, default: false },
    businessCategory: { type: String, required: true },
    country: { type: String, required: false },
    primaryEmail: { type: String, required: false },
    // wallets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Wallet" }],
  },
  {
    timestamps: true,
  }
);

export const Business = mongoose.model<IBusiness>("Business", BusinessSchema);
