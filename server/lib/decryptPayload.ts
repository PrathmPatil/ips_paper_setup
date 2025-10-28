// src/utils/decryptPayload.ts
import CryptoJS from "crypto-js";

/**
 * Decrypt AES-encrypted payload sent from the frontend.
 * @param encryptedData - The AES-encrypted string.
 * @param secretKey - The same ENCRYPTION_KEY used on the frontend.
 * @returns The decrypted object (parsed JSON).
 */
export function decryptPayload<T = Record<string, any>>(encryptedData: string, secretKey: string): T | null {
  try {
    // Decrypt using the same key and algorithm
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);

    // Convert bytes to UTF-8 string
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedText) {
      console.error("❌ Decryption failed: invalid ciphertext or key");
      return null;
    }
    console.log(decryptedText)
    // Parse back to object
    return JSON.parse(decryptedText) as T;
  } catch (error) {
    console.error("❌ Error decrypting payload:", error);
    return null;
  }
}
