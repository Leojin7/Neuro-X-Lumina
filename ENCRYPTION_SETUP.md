# AES-256 Chat Encryption Setup

## Generate a Secure Encryption Key

For production deployment, generate a cryptographically secure random key:

### Option 1: Using Node.js (Recommended)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Option 2: Using OpenSSL
```bash
openssl rand -hex 32
```

### Option 3: Online Generator (for development only)
Visit: https://randomkeygen.com/ and select "AES-256" (32 bytes, 64 hex characters)

## Add to Environment

Add the generated key to your `.env.local` file:

```bash
VITE_CHAT_ENCRYPTION_KEY=your-64-character-hex-key-here
```

## Security Notes

- **Never commit the encryption key to version control**
- **Use different keys for development and production**
- **Store the key securely in your hosting provider's environment variables**
- **Key should be exactly 64 hexadecimal characters (32 bytes)**

## Example Key Format
```
VITE_CHAT_ENCRYPTION_KEY=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

## How It Works

- Messages are encrypted using AES-256-CBC before sending to Firebase
- Only users with the correct encryption key can decrypt messages
- Even if Firebase is compromised, chat content remains secure
- AI messages are not encrypted (system notifications)
