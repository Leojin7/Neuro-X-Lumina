import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, addDoc, query, where, orderBy, limit, getDocs, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { StudySquad, SquadMessage } from '../types';

let database: any = null;

try {
  const app = initializeApp(window.firebaseConfig);
  database = getFirestore(app);

  console.log('🔥 Firestore Database initialized successfully');

} catch (error) {
  console.error('Failed to initialize Firestore Database:', error);
}

export class FirebaseSquadService {
  static async createSquad(squad: StudySquad): Promise<void> {
    if (!database) {
      console.warn('Firestore not available, squad creation failed');
      throw new Error('Database not available');
    }
    const squadRef = doc(database, 'squads', squad.id);
    await setDoc(squadRef, squad);
  }

  static async joinSquad(squadId: string, member: any): Promise<void> {
    if (!database) {
      console.warn('Firestore not available, squad join failed');
      throw new Error('Database not available');
    }
    const squadRef = doc(database, 'squads', squadId);
    // Use arrayUnion to add member without overwriting existing ones
    await updateDoc(squadRef, {
      members: arrayUnion(member)
    });
  }

  static async leaveSquad(squadId: string, userId: string): Promise<void> {
    if (!database) {
      console.warn('Firestore not available, squad leave failed');
      throw new Error('Database not available');
    }
    const squadRef = doc(database, 'squads', squadId);
    const squadSnap = await getDoc(squadRef);
    const squadData = squadSnap.data();

    if (!squadData || !squadData.members || squadData.members.length <= 1) {
      await deleteDoc(squadRef);
    } else {
      await updateDoc(squadRef, {
        members: squadData.members.filter((m: any) => m.uid !== userId)
      });
    }
  }

  static async sendMessage(squadId: string, message: SquadMessage): Promise<void> {
    if (!database) {
      console.warn('Firestore not available, message sending failed');
      throw new Error('Database not available');
    }
    const messagesRef = collection(database, 'squads', squadId, 'messages');
    await addDoc(messagesRef, message);
  }

  static async updateTimer(squadId: string, timerState: any): Promise<void> {
    if (!database) {
      console.warn('Firestore not available, timer update failed');
      throw new Error('Database not available');
    }
    const squadRef = doc(database, 'squads', squadId);
    await updateDoc(squadRef, { timerState });
  }

  static subscribeToSquad(squadId: string, callback: (squad: StudySquad | null) => void): () => void {
    if (!database) {
      console.warn('Firestore not available, squad subscription failed');
      callback(null);
      return () => { };
    }

    const squadRef = doc(database, 'squads', squadId);
    const messagesRef = collection(database, 'squads', squadId, 'messages');

    // Subscribe to squad document
    const squadUnsubscribe = onSnapshot(squadRef, (docSnap) => {
      if (docSnap.exists()) {
        const squadData = { id: docSnap.id, ...docSnap.data() } as StudySquad;

        // Subscribe to messages subcollection
        const messagesUnsubscribe = onSnapshot(
          query(messagesRef, orderBy('timestamp', 'asc')),
          (messagesSnap) => {
            const messages = messagesSnap.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as SquadMessage[];

            callback({ ...squadData, messages });
          }
        );

        // Return cleanup function that includes both unsubscribes
        return () => {
          squadUnsubscribe();
          messagesUnsubscribe();
        };
      } else {
        callback(null);
      }
    });

    return squadUnsubscribe;
  }

  static subscribeToAllSquads(callback: (squads: StudySquad[]) => void): () => void {
    if (!database) {
      console.warn('Firestore not available, returning empty squads list');
      callback([]);
      return () => { };
    }

    const squadsRef = collection(database, 'squads');
    const q = query(squadsRef, where('members', '!=', null));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const squads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StudySquad[];

      callback(squads);
    });

    return unsubscribe;
  }

  static async deleteSquad(squadId: string): Promise<void> {
    if (!database) {
      console.warn('Firestore not available, squad deletion failed');
      throw new Error('Database not available');
    }

    const squadRef = doc(database, 'squads', squadId);
    await deleteDoc(squadRef);
  }
}

// Helper function for array operations in Firestore
// arrayUnion and arrayRemove are already imported above
