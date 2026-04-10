// Debug Firebase Connection
import { getDatabase, ref, onValue } from 'firebase/database';

export const testFirebaseConnection = () => {
  try {
    const database = getDatabase();
    const testRef = ref(database, '.info/connected');
    
    onValue(testRef, (snapshot) => {
      const connected = snapshot.val();
      console.log('🔥 Firebase Connection Status:', connected ? '✅ Connected' : '❌ Disconnected');
    });
    
    console.log('🔥 Testing Firebase connection...');
  } catch (error) {
    console.error('🔥 Firebase connection test failed:', error);
  }
};
