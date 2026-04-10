# 🔍 Firebase Real-Time Debugging Guide

## **Step 1: Check Console Logs**

Run your app and look for these debug messages:

### **Expected Logs:**
```
🔥 Firebase Database initialized successfully
🔍 Starting Firebase structure debug...
📁 Squads data: { squadId: { ... } }
📊 Squad IDs: ["squad-123", "squad-456"]
📋 Squad squad-123: { name: "...", members: [...], ... }
🔗 Subscribing to squad: squad-123
👀 Starting to monitor squad: squad-123
📡 Squad squad-123 update: { exists: true, data: {...} }
✅ Processed squad squad-123: { id: "squad-123", ... }
```

### **Problem Logs:**
```
❌ Squad squad-123 deleted or empty
📡 Squad squad-123 update: { exists: false, val: null }
❌ Failed to send message: [error]
```

## **Step 2: Test Individual Features**

### **A) Squad Creation:**
1. Go to `/squad` page
2. Click "Create Squad"
3. Check console for creation logs
4. Verify in Firebase Console → Realtime Database → Data

### **B) Real-time Sync:**
1. Open same squad in 2 browser tabs
2. Send message in one tab
3. Should see update in other tab
4. Check console for subscription logs

### **C) Timer Controls:**
1. As host, click Start/Pause button
2. Check console for timer logs
3. Verify timer updates across all tabs

## **Step 3: Common Issues & Fixes**

### **Issue: No Real-time Updates**
**Problem**: Messages don't sync across tabs
**Cause**: Firebase rules blocking reads
**Fix**: Update Firebase Rules:
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

### **Issue: Timer Not Working**
**Problem**: Timer controls don't update
**Cause**: Host permission check failing
**Fix**: Verify `currentUser.uid` matches `squad.hostId`

### **Issue: Leave Squad Not Working**
**Problem**: Leave button does nothing
**Cause**: Firebase permission or subscription issue
**Fix**: Check member removal logic in Firebase

## **Step 4: Firebase Console Check**

### **Data Structure Should Look Like:**
```
squads/
  squad-123/
    name: "Study Squad"
    topic: "React"
    hostId: "user123"
    members/
      user123: { uid: "user123", displayName: "..." }
      user456: { uid: "user456", displayName: "..." }
    messages/
      msg-789: { author: {...}, content: "...", timestamp: "..." }
    timerState/
      mode: "pomodoro"
      timeLeft: 1500
      isActive: false
```

## **Step 5: Test Commands**

### **Clear Browser Cache:**
```bash
# In browser console
localStorage.clear()
location.reload()
```

### **Test Firebase Connection:**
```bash
# In browser console
fetch('https://fir-frontend-d1549-default-rtdb.firebaseio.com/.json')
  .then(r => r.json())
  .then(console.log)
```

## **Expected Debug Output:**

**Working App Should Show:**
- ✅ Firebase initialization success
- ✅ Squad creation logs
- ✅ Real-time subscription logs
- ✅ Message sending/receiving logs
- ✅ Timer update logs
- ✅ Member join/leave logs

**Run through this checklist and let me know what you see!** 🔍
