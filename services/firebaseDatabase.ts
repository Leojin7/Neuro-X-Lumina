import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set, onValue, off, remove, update } from 'firebase/database';
import type { StudySquad, SquadMessage } from '../types';

// Enhanced Firebase debugging
const debugFirebaseStructure = () => {
  console.log('🔍 Starting Firebase structure debug...');

  try {
    const database = getDatabase();

    // Test squads level
    const squadsRef = ref(database, 'squads');
    onValue(squadsRef, (snapshot) => {
      console.log('📁 Squads data:', snapshot.val());
      const data = snapshot.val();
      if (data) {
        console.log('📊 Squad IDs:', Object.keys(data));
        Object.keys(data).forEach(squadId => {
          console.log(`📋 Squad ${squadId}:`, data[squadId]);
        });
      }
    }, { onlyOnce: true });

  } catch (error) {
    console.error('🔍 Debug failed:', error);
  }
};

const monitorSquadUpdates = (squadId: string) => {
  console.log(`👀 Starting to monitor squad: ${squadId}`);

  try {
    const database = getDatabase();
    const squadRef = ref(database, `squads/${squadId}`);

    const unsubscribe = onValue(squadRef, (snapshot) => {
      console.log(`📡 Squad ${squadId} update:`, {
        exists: snapshot.exists(),
        data: snapshot.val()
      });
    });

    return unsubscribe;
  } catch (error) {
    console.error('👀 Monitor failed:', error);
    return () => { };
  }
};

let database: any = null;

try {
  const app = initializeApp(window.firebaseConfig);
  database = getDatabase(app);

  console.log('Firebase Database initialized successfully');

  // Debug structure on load
  setTimeout(() => {
    debugFirebaseStructure();
  }, 2000);

} catch (error) {
  console.error('Failed to initialize Firebase Database:', error);
}
export class FirebaseSquadService {

  static async createSquad(squad: StudySquad): Promise<void> {
    if (!database) {
      console.warn('Firebase not available, squad creation failed');
      throw new Error('Database not available');
    }
    const squadRef = ref(database, `squads/${squad.id}`);
    await set(squadRef, squad);
  }

  static async joinSquad(squadId: string, member: any): Promise<void> {
    if (!database) {
      console.warn('Firebase not available, squad join failed');
      throw new Error('Database not available');
    }
    const memberRef = ref(database, `squads/${squadId}/members/${member.uid}`);
    await set(memberRef, member);
  }

  static async leaveSquad(squadId: string, userId: string): Promise<void> {
    if (!database) {
      console.warn('Firebase not available, squad leave failed');
      throw new Error('Database not available');
    }
    const memberRef = ref(database, `squads/${squadId}/members/${userId}`);
    await remove(memberRef);

    const squadRef = ref(database, `squads/${squadId}`);
    const snapshot = await new Promise((resolve) => {
      onValue(squadRef, resolve, { onlyOnce: true });
    }) as any;
    const squadData = snapshot.val();
    if (!squadData || !squadData.members || Object.keys(squadData.members).length === 0) {
      await this.deleteSquad(squadId);
    }
  }

  static async sendMessage(squadId: string, message: SquadMessage): Promise<void> {
    if (!database) {
      console.warn('Firebase not available, message sending failed');
      throw new Error('Database not available');
    }
    const messagesRef = ref(database, `squads/${squadId}/messages`);
    await push(messagesRef, message);
  }

  static async updateTimer(squadId: string, timerState: any): Promise<void> {
    if (!database) {
      console.warn('Firebase not available, timer update failed');
      throw new Error('Database not available');
    }
    const timerRef = ref(database, `squads/${squadId}/timerState`);
    await set(timerRef, timerState);
  }
  static subscribeToSquad(squadId: string, callback: (squad: StudySquad | null) => void): () => void {
    if (!database) {
      console.warn('Firebase not available, squad subscription failed');
      callback(null);
      return () => { };
    }
    console.log(`🔗 Subscribing to squad: ${squadId}`);
    const squadRef = ref(database, `squads/${squadId}`);

    // Add monitor for debugging
    monitorSquadUpdates(squadId);

    const unsubscribe = onValue(squadRef, (snapshot) => {
      console.log(`📡 Squad ${squadId} received update:`, {
        exists: snapshot.exists(),
        val: snapshot.val()
      });

      try {
        const data = snapshot.val();
        if (data) {

          const squad: StudySquad = {
            ...data,
            messages: data.messages ? Object.values(data.messages).sort((a: any, b: any) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            ) :
              [],
            members: data.members ? Object.values(data.members) : []
          };
          console.log(`✅ Processed squad ${squadId}:`, squad);
          callback(squad);
        }
        else {
          console.log(`❌ Squad ${squadId} deleted or empty`);
          callback(null);
        }
      }
      catch (error) {
        console.error('Error processing squad data:', error);
        callback(null);
      }
    },
      (error) => {
        console.error('Firebase subscription error:', error);
        callback(null);
      });
    return () => off(squadRef, 'value', unsubscribe);
  }

  static subscribeToAllSquads(callback: (squads: StudySquad[]) => void): () => void {
    if (!database) {
      console.warn('Firebase not available, returning empty squads list');
      callback([]);
      return () => { };
    }
    const squadsRef = ref(database, 'squads');
    const unsubscribe = onValue(squadsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const squads = Object.values(data)
            .map((squadData: any) => ({
              ...squadData,
              messages: squadData.messages ? Object.values(squadData.messages).sort((a: any, b: any) =>
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
              ) : [],
              members: squadData.members ? Object.values(squadData.members) : []
            }))
            .filter((squad: any) => squad.members && squad.members.length > 0) as StudySquad[];
          callback(squads);
        } else {
          callback([]);
        }
      } catch (error) {
        console.error('Error processing squads data:', error);
        callback([]);
      }
    }, (error) => {
      console.error('Firebase squads subscription error:', error);
      callback([]);
    });
    return () => off(squadsRef, 'value', unsubscribe);
  }

  static async deleteSquad(squadId: string): Promise<void> {
    if (!database) {

      console.warn('Firebase not available, squad deletion failed');
      throw new Error('Database not available');
    }

    const squadRef = ref(database, `squads/${squadId}`);
    await remove(squadRef);
  }
}
