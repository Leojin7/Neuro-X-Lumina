
export const encrypt = (text: string): string => {
    try {

        return btoa(unescape(encodeURIComponent(text)));
    } catch (e) {
        console.error("Encryption failed:", e);
        return text; // Fallback to plaintext if encoding fails
    }
};
export const decrypt = (encryptedText: string): string => {
    try {

        return decodeURIComponent(escape(atob(encryptedText)));
    } catch (e) {

        return encryptedText;
    }
};
