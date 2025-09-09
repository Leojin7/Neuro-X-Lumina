
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StudySquad, SquadMember, CurrentUser } from '../types';
import { useUserStore } from './useUserStore';
import { encrypt } from '../services/encryptionService';
import { FirebaseSquadService } from '../services/firebaseDatabase';
interface SquadState {
  squads: StudySquad[];
  activeSubscriptions: Record<string, () => void>;
  createSquad: (name: string, topic: string) => Promise<StudySquad | null>;
  joinSquad: (squadId: string) => Promise<boolean>;
  joinSquadByCode: (code: string) => Promise<StudySquad | null>;
  leaveSquad: (squadId: string) => Promise<void>;
  getSquadById: (squadId: string) => StudySquad | undefined;
  sendMessage: (squadId: string, content: string) => Promise<void>;
  postAIMessage: (squadId: string, content: string) => Promise<void>;
  subscribeToSquad: (squadId: string) => void;
  unsubscribeFromSquad: (squadId: string) => void;
  subscribeToAllSquads: () => void;
  unsubscribeFromAllSquads: () => void;
  // Timer controls
  toggleTimer: (squadId: string) => Promise<void>;
  resetTimer: (squadId: string) => Promise<void>;
  decrementTimer: (squadId: string) => void;
  deleteSquad: (squadId: string) => Promise<void>;
}
const MOCK_SQUADS: StudySquad[] = [
  {
    id: 'squad-1', name: 'Late Night Study Crew', topic: 'Calculus II', hostId: 'mock-user-1',
    members: [{ uid: 'mock-user-1', displayName: 'Alex', photoURL: 'https://i.pravatar.cc/40?u=alex' }],
    messages: [], timerState: { mode: 'pomodoro', timeLeft: 25 * 60, isActive: false },
    isPrivate: false, createdAt: new Date().toISOString(), joinCode: 'CALC123'
  },
  {
    id: 'squad-2', name: 'Frontend Masters', topic: 'React & TypeScript', hostId: 'mock-user-2',
    members: [
        { uid: 'mock-user-2', displayName: 'Samantha', photoURL: 'https://i.pravatar.cc/40?u=samantha' },
        { uid: 'mock-user-3', displayName: 'Jordan', photoURL: 'https://i.pravatar.cc/40?u=jordan' },
    ],
    messages: [], timerState: { mode: 'pomodoro', timeLeft: 25 * 60, isActive: true },
    isPrivate: false, createdAt: new Date().toISOString(), joinCode: 'REACTUX'
  },
];
export const useSquadStore = create<SquadState>()(
  persist(
    (set, get) => ({
      squads: [],
      activeSubscriptions: {},
      getSquadById: (squadId) => get().squads.find(s => s.id === squadId),
      createSquad: async (name, topic) => {
        const currentUser = useUserStore.getState().currentUser;
        console.log('createSquad called with:', { name, topic, currentUser });
        if (!currentUser) {
          console.error('No current user found');
          return null;
        }
        const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const newSquad: StudySquad = {
          id: `squad-${Date.now()}`,
          name,
          topic,
          hostId: currentUser.uid,
          members: [{ uid: currentUser.uid, displayName: currentUser.displayName || 'User', photoURL: currentUser.photoURL || `https://i.pravatar.cc/40?u=${currentUser.uid}` }],
          messages: [],
          timerState: { mode: 'pomodoro', timeLeft: 25 * 60, isActive: false },
          isPrivate: false,
          createdAt: new Date().toISOString(),
          joinCode,
        };
        try {
          console.log('Attempting to create squad in Firebase:', newSquad);
          await FirebaseSquadService.createSquad(newSquad);
          console.log('Squad created in Firebase successfully');
          // Update local state immediately after successful creation
          set(state => ({ squads: [...state.squads, newSquad] }));
          console.log('Local state updated with new squad');
          return newSquad;
        } catch (error) {
          console.error('Failed to create squad:', error);
          return null;
        }
      },
      joinSquad: async (squadId) => {
        const currentUser = useUserStore.getState().currentUser;
        if (!currentUser) return false;
        const squad = get().getSquadById(squadId);
        if (!squad) {
          console.warn(`Squad ${squadId} not found in local state`);
          return false;
        }
        if (squad.members.some(m => m.uid === currentUser.uid)) return true; // Already in squad
        const newMember: SquadMember = {
            uid: currentUser.uid, 
            displayName: currentUser.displayName || 'User', 
            photoURL: currentUser.photoURL || `https://i.pravatar.cc/40?u=${currentUser.uid}`
        };
        try {
          await FirebaseSquadService.joinSquad(squadId, newMember);
          console.log(`Successfully joined squad ${squadId}`);
          return true;
        } catch (error) {
          console.error('Failed to join squad:', error);
          return false;
        }
      },
      joinSquadByCode: async (code) => {
        const squad = get().squads.find(s => s.joinCode === code.toUpperCase());
        if (!squad) {
            return null;
        }
        const success = await get().joinSquad(squad.id);
        return success ? squad : null;
      },
      leaveSquad: async (squadId) => {
        const currentUser = useUserStore.getState().currentUser;
        console.log('leaveSquad called with:', { squadId, currentUser });
        if (!currentUser) {
          console.error('No current user found for leaving squad');
          return;
        }
        try {
          console.log('Attempting to leave squad in Firebase:', squadId);
          await FirebaseSquadService.leaveSquad(squadId, currentUser.uid);
          console.log('Left squad in Firebase successfully');
          get().unsubscribeFromSquad(squadId);
          // Remove squad from local state if user was the last member
          const squad = get().getSquadById(squadId);
          if (squad && squad.members.length <= 1) {
            set(state => ({ squads: state.squads.filter(s => s.id !== squadId) }));
          }
          console.log(`Successfully left squad ${squadId}`);
        } catch (error) {
          console.error('Failed to leave squad:', error);
          throw error;
        }
      },
      sendMessage: async (squadId, content) => {
        const currentUser = useUserStore.getState().currentUser;
        if (!currentUser) return;
        const author: SquadMember = {
            uid: currentUser.uid, 
            displayName: currentUser.displayName || 'User', 
            photoURL: currentUser.photoURL || `https://i.pravatar.cc/40?u=${currentUser.uid}`
        };
        const newMessage = {
            id: `msg-${Date.now()}`,
            author,
            content: encrypt(content),
            timestamp: new Date().toISOString(),
        };
        try {
          await FirebaseSquadService.sendMessage(squadId, newMessage);
        } catch (error) {
          console.error('Failed to send message:', error);
        }
      },
      postAIMessage: async (squadId, content) => {
          const aiAuthor: SquadMember = {
              uid: 'lumina-ai-observer',
              displayName: 'AI Observer',
              photoURL: '', // No avatar for AI
          };
          const aiMessage = {
              id: `ai-msg-${Date.now()}`,
              author: aiAuthor,
              content, // AI messages are not encrypted
              timestamp: new Date().toISOString(),
              isAIMessage: true,
          };
          try {
            await FirebaseSquadService.sendMessage(squadId, aiMessage);
          } catch (error) {
            console.error('Failed to send AI message:', error);
          }
      },
      subscribeToSquad: (squadId: string) => {
        const unsubscribe = FirebaseSquadService.subscribeToSquad(squadId, (squad) => {
          set(state => ({
            squads: squad 
              ? [...state.squads.filter(s => s.id !== squadId), squad]
              : state.squads.filter(s => s.id !== squadId)
          }));
        });
        const subscriptions = get().activeSubscriptions;
        set({ activeSubscriptions: { ...subscriptions, [squadId]: unsubscribe } });
      },
      unsubscribeFromSquad: (squadId: string) => {
        const subscriptions = get().activeSubscriptions;
        const unsubscribe = subscriptions[squadId];
        if (unsubscribe) {
          unsubscribe();
          const { [squadId]: removed, ...rest } = subscriptions;
          set({ activeSubscriptions: rest });
        }
      },
      subscribeToAllSquads: () => {
        const unsubscribe = FirebaseSquadService.subscribeToAllSquads((squads) => {
          set({ squads });
        });
        const subscriptions = get().activeSubscriptions;
        set({ activeSubscriptions: { ...subscriptions, 'all-squads': unsubscribe } });
      },
      unsubscribeFromAllSquads: () => {
        const subscriptions = get().activeSubscriptions;
        const unsubscribe = subscriptions['all-squads'];
        if (unsubscribe) {
          unsubscribe();
          const { 'all-squads': removed, ...rest } = subscriptions;
          set({ activeSubscriptions: rest });
        }
      },
      // Timer controls
      toggleTimer: async (squadId: string) => {
        const currentUser = useUserStore.getState().currentUser;
        const squad = get().getSquadById(squadId);
        if (!currentUser || !squad || squad.hostId !== currentUser.uid) return; // Only host can control timer
        const newTimerState = { ...squad.timerState, isActive: !squad.timerState.isActive };
        try {
          await FirebaseSquadService.updateTimer(squadId, newTimerState);
        } catch (error) {
          console.error('Failed to toggle timer:', error);
        }
      },
      resetTimer: async (squadId: string) => {
        const currentUser = useUserStore.getState().currentUser;
        const squad = get().getSquadById(squadId);
        if (!currentUser || !squad || squad.hostId !== currentUser.uid) return;
        const newTimerState = { ...squad.timerState, timeLeft: 25 * 60, isActive: false };
        try {
          await FirebaseSquadService.updateTimer(squadId, newTimerState);
        } catch (error) {
          console.error('Failed to reset timer:', error);
        }
      },
      decrementTimer: (squadId) => {
        const squad = get().getSquadById(squadId);
        if (!squad || squad.timerState.timeLeft <= 0) return;
        const newTimeLeft = squad.timerState.timeLeft - 1;
        const newIsActive = newTimeLeft > 0 ? squad.timerState.isActive : false;
        const newTimerState = { ...squad.timerState, timeLeft: newTimeLeft, isActive: newIsActive };
        // Update Firebase (fire and forget for performance)
        FirebaseSquadService.updateTimer(squadId, newTimerState).catch(console.error);
      },
      deleteSquad: async (squadId: string) => {
        const currentUser = useUserStore.getState().currentUser;
        console.log('deleteSquad called with:', { squadId, currentUser });
        if (!currentUser) {
          console.error('No current user found for deleting squad');
          return;
        }
        const squad = get().getSquadById(squadId);
        console.log('Squad to delete:', squad);
        if (!squad || squad.hostId !== currentUser.uid) {
          console.warn('Only the host can delete the squad', { squad, hostId: squad?.hostId, currentUserId: currentUser.uid });
          throw new Error('Only the host can delete the squad');
        }
        try {
          console.log('Attempting to delete squad in Firebase:', squadId);
          await FirebaseSquadService.deleteSquad(squadId);
          console.log('Deleted squad in Firebase successfully');
          get().unsubscribeFromSquad(squadId);
          set(state => ({ squads: state.squads.filter(s => s.id !== squadId) }));
          console.log(`Successfully deleted squad ${squadId}`);
        } catch (error) {
          console.error('Failed to delete squad:', error);
          throw error;
        }
      },
    }),
    {
      name: 'lumina-squad-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Don't persist activeSubscriptions as they need to be recreated on app load
        squads: state.squads,
      }),
    }
  )
);