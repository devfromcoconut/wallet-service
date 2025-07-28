import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  hasPasscode: boolean;
  password: string;
  passcode: string;
  role: "admin" | "user";
  debt: number;
  plan?: "free" | "sme" | "growth";
  nextPlan?: "free" | "sme" | "growth";
  // subscriptionId?: string;
  subscriptionStatus?: "active" | "inactive";
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  kycVerified: boolean;
  legalNumber: string;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    hasPasscode: { type: Boolean, required: true, default: false },
    passcode: { type: String },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    debt: { type: Number, required: false, default: 0 },   
    plan: { type: String, enum: ["free", "sme", "growth"], default: "free" },
    nextPlan: { type: String, enum: ["free", "sme", "growth"], default: "free" },
    // subscriptionId: { type: Schema.Types.ObjectId, ref: "Subscription", required: false },
    subscriptionStatus: { type: String, enum: ["active", "inactive"], default: "inactive" },
    subscriptionStartDate: { type: Date, required: false },
    subscriptionEndDate: { type: Date, required: false },
    kycVerified: { type: Boolean, default: false },
    legalNumber: { type: String, default: "" }
  },
  {  
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>("users", UserSchema);
