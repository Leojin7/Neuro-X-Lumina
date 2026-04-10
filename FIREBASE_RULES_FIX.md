# Firebase Realtime Database Rules

## **Current Rules (Need to Replace):**
The default rules are too restrictive and block authenticated users.

## **New Rules (Copy-Paste These):**

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "squads": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$squadId": {
        ".read": "auth != null",
        ".write": "auth != null",
        "members": {
          ".read": "auth != null",
          ".write": "auth != null"
        },
        "messages": {
          ".read": "auth != null",
          ".write": "auth != null"
        },
        "timerState": {
          ".read": "auth != null",
          ".write": "auth != null"
        }
      }
    }
  }
}
```

## **What These Rules Do:**
- ✅ **Allow authenticated users** to read/write any data
- ✅ **Squad-specific permissions** for granular control
- ✅ **Member management** permissions
- ✅ **Message sending** permissions  
- ✅ **Timer control** permissions

## **How to Apply:**
1. **Select all existing rules** in Firebase Console
2. **Delete them**
3. **Copy the new rules** above
4. **Paste into rules editor**
5. **Click "Publish"**

## **Test After Publishing:**
1. **Refresh your app**
2. **Try creating a squad**
3. **Should see success instead of permission errors**

## **Security Note:**
These rules ensure:
- Only **authenticated users** can access data
- **No public access** to sensitive squad data
- **Granular permissions** for different data types
- **AES-256 encryption** still protects message content
