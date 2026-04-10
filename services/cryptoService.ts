import CryptoJS from 'crypto-js';

// In a real app, this key should be in your .env file
const SECRET_KEY = import.meta.env.VITE_CHAT_ENCRYPTION_KEY || 'your-fallback-secure-key';

export const encryptMessage = (text: string): string => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

export const decryptMessage = (cipherText: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText || '[Decryption Error: Message Tampered]';
  } catch (error) {
    return '[Encrypted Message]';
  }
};
