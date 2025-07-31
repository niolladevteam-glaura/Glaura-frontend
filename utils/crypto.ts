import CryptoJS from "crypto-js";

const SECRET = process.env.NEXT_PUBLIC_OTP_SECRET || "default_secret_key"; // must match for encrypt/decrypt

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, SECRET).toString();
}

export function decrypt(cipher: string): string {
  const bytes = CryptoJS.AES.decrypt(cipher, SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
}