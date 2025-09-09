import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set, onValue, off, remove, update } from 'firebase/database';
import type { StudySquad, SquadMessage } from '../types';
// Initialize Firebase Database with error handling
let database: any = null;
try {
  const app = initializeApp(window.firebaseConfig);
  database = getDatabase(app);
  console.log('Firebase Database initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase Database:', error);
}
export class FirebaseSquadService {
  // Create a new squad in Firebase
  static async createSquad(squad: StudySquad): Promise<void> {
    if (!database) {
      console.warn('Firebase not available, squad creation failed');
      throw new Error('Database not available');
    }
    const squadRef = ref(database, `squads/${squad.id}`);
    await set(squadRef, squad);
  }
  // Join an existing squad
  static async joinSquad(squadId: string, member: any): Promise<void> {
    if (!database) {
      console.warn('Firebase not available, squad join failed');
      throw new Error('Database not available');
    }
    const memberRef = ref(database, `squads/${squadId}/members/${member.uid}`);
    await set(memberRef, member);
  }
  // Leave a squad
  static async leaveSquad(squadId: string, userId: string): Promise<void> {
    if (!database) {
      console.warn('Firebase not available, squad leave failed');
      throw new Error('Database not available');
    }
    const memberRef = ref(database, `squads/${squadId}/members/${userId}`);
    await remove(memberRef);
    // Check if squad is empty and delete it
    const squadRef = ref(database, `squads/${squadId}`);
    const snapshot = await new Promise((resolve) => {
      onValue(squadRef, resolve, { onlyOnce: true });
    }) as any;
    const squadData = snapshot.val();
    if (!squadData || !squadData.members || Object.keys(squadData.members).length === 0) {
      await this.deleteSquad(squadId);
    }
  }
  // Send a message to a squad
  static async sendMessage(squadId: string, message: SquadMessage): Promise<void> {
    if (!database) {
      console.warn('Firebase not available, message sending failed');
      throw new Error('Database not available');
    }
    const messagesRef = ref(database, `squads/${squadId}/messages`);
    await push(messagesRef, message);
  }
  // Update timer state
  static async updateTimer(squadId: string, timerState: any): Promise<void> {
    if (!database) {
      console.warn('Firebase not available, timer update failed');
      throw new Error('Database not available');
    }
    const timerRef = ref(database, `squads/${squadId}/timerState`);
    await set(timerRef, timerState);
  }
  // Listen to squad changes
  static subscribeToSquad(squadId: string, callback: (squad: StudySquad | null) => void): () => void {
    if (!database) {
      console.warn('Firebase not available, squad subscription failed');
      callback(null);
      return () => {};
    }
    const squadRef = ref(database, `squads/${squadId}`);
    const unsubscribe = onValue(squadRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          // Convert Firebase object format to array format for messages and members
          const squad: StudySquad = {
            ...data,
            messages: data.messages ? Object.values(data.messages).sort((a: any, b: any) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            ) : [],
            members: data.members ? Object.values(data.members) : []
          };
          callback(squad);
        } else {
          callback(null);
        }
      } catch (error) {
        console.error('Error processing squad data:', error);
        callback(null);
      }
    }, (error) => {
      console.error('Firebase subscription error:', error);
      callback(null);
    });
    return () => off(squadRef, 'value', unsubscribe);
  }
  // Get all available squads
  static subscribeToAllSquads(callback: (squads: StudySquad[]) => void): () => void {
    if (!database) {
      console.warn('Firebase not available, returning empty squads list');
      callback([]);
      return () => {};
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
  // Delete empty squads
  static async deleteSquad(squadId: string): Promise<void> {
    if (!database) {
      console.warn('Firebase not available, squad deletion failed');
      throw new Error('Database not available');
    }
    const squadRef = ref(database, `squads/${squadId}`);
    await remove(squadRef);
  }
}
