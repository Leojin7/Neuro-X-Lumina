
// In a real-world application, this would use robust, end-to-end encryption libraries like libsodium or the Web Crypto API.
// This approach demonstrates the architectural separation of encryption logic.
export const encrypt = (text: string): string => {
    try {
        // btoa doesn't handle UTF-8 characters well, so we need to encode them first.
        return btoa(unescape(encodeURIComponent(text)));
    } catch (e) {
        console.error("Encryption failed:", e);
        return text; // Fallback to plaintext if encoding fails
    }
};
export const decrypt = (encryptedText: string): string => {
    try {
        // Decode the Base64 and then decode the URI component to get original UTF-8 string.
        return decodeURIComponent(escape(atob(encryptedText)));
    } catch (e) {
        // This can fail if the text is not valid Base64 (e.g., an unencrypted old message or AI message).
        return encryptedText; // Fallback to returning the text as is.
    }
};
