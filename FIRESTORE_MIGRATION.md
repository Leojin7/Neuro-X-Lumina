# Firebase Migration Guide: Realtime Database → Firestore

## Why Switch to Firestore?

### **For Your Viva Presentation:**
"**I chose Cloud Firestore over Realtime Database because:**
1. **Better Scalability**: Document-based structure scales more efficiently for collaborative features
2. **Powerful Queries**: Compound queries enable complex filtering (e.g., squads by member + topic)
3. **Offline Support**: Built-in caching and offline persistence
4. **Security Rules**: More granular permissions at document level
5. **Modern Architecture**: Industry standard for new Firebase projects"

### **Technical Benefits:**
- ✅ **Structured Data**: Collections and Documents vs JSON tree
- ✅ **Better Performance**: Optimized for mobile/web apps
- ✅ **Advanced Queries**: Filtering, sorting, pagination
- ✅ **Security**: Document-level permissions
- ✅ **SDK Support**: Better TypeScript support

## Migration Steps

### 1. Update Firebase Configuration
```typescript
// In firebaseDatabase.ts or new firebaseFirestore.ts
import { getFirestore } from 'firebase/firestore';
const database = getFirestore(app);
```

### 2. Update Data Structure
**Realtime Database:**
```
squads/
  squadId/
    members: [...]
    messages/
      messageId: {...}
```

**Firestore:**
```
squads/ (collection)
  squadId/ (document)
    members: [...]
    messages/ (subcollection)
      messageId/ (document)
```

### 3. Update Squad Store
Replace Realtime Database calls with Firestore:
- `ref()` → `doc()` or `collection()`
- `set()` → `setDoc()` or `addDoc()`
- `onValue()` → `onSnapshot()`
- `update()` → `updateDoc()`
- `remove()` → `deleteDoc()`

## Files to Update
- ✅ `services/firebaseFirestore.ts` - New Firestore service
- ⏳ `stores/useSquadStore.ts` - Update imports
- ⏳ Test squad creation and real-time sync

## Security Rules Update

### Firestore Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /squads/{squadId} {
      allow read, write: if request.auth != null;
      match /messages/{messageId} {
        allow read, write: if request.auth != null;
      }
    }
  }
}
```

## Testing Checklist
- [ ] Squad creation works
- [ ] Real-time message sync
- [ ] Member join/leave
- [ ] Timer synchronization
- [ ] AES-256 encryption still works
