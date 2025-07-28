import crypto from "crypto";

/**
 * Generates a 6-digit OTP
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generates a 16-digit random numbers
 */
export const generateTxId = (): string => {
  return Math.floor(
    1000000000000000 + Math.random() * 9000000000000000
  ).toString();
};

export const otpExpiryTime = () => {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
};

// generate code for admin
export const generateAdminCode = (length: number = 16): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let code = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
};