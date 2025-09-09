import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { QuizResult, SubscriptionTier, RecentlyDeletedQuiz, CurrentUser, DailyMission, FocusStory, DailyCheckin, GratitudeEntry, MindShiftEntry, Mood, CodingSubmission, Language, Habit, SleepEntry, Note, CognitiveStateAnalysis } from '../types';
import { User, logOut, updateUserProfile as fbUpdateUserProfile, auth } from '../firebaseAuth';
import { generateStudyPlan } from '../services/geminiService';
const toYYYYMMDD = (date: Date) => date.toISOString().slice(0, 10);
const isYesterday = (dateStr: string) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return toYYYYMMDD(yesterday) === dateStr;
};
const TICKET_COST = 100;
interface UserProfileUpdate {
    displayName?: string;
    photoURL?: string;
}
interface UserState {
  currentUser: CurrentUser | null;
  focusCoins: number;
  subscriptionTier: SubscriptionTier;
  completedQuizzes: QuizResult[];
  recentlyDeleted: RecentlyDeletedQuiz[];
  unlockedQuizIds: string[];
  studyPlan: DailyMission[] | null;
  isPlanGenerating: boolean;
  focusStories: FocusStory[];
  focusStreak: number;
  lastFocusSessionDate: string | null;
  // Wellness Features
  dailyCheckins: DailyCheckin[];
  gratitudeEntries: GratitudeEntry[];
  mindShiftEntries: MindShiftEntry[];
  habits: Habit[];
  sleepEntries: SleepEntry[];
  notes: Note[];
  // Coding Arena
  codingXP: number;
  codingStreak: number;
  lastCodingDate: string | null;
  timeTravelTickets: number;
  codingSubmissions: CodingSubmission[];
  setCurrentUser: (user: CurrentUser | null) => void;
  checkAuthStatus: () => void;
  logoutUser: () => Promise<void>;
  clearUser: () => void;
  updateUserProfile: (updates: UserProfileUpdate) => Promise<void>;
  addCompletedQuiz: (result: QuizResult) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  upgradeSubscription: (tier: 'pro' | 'elite') => void;
  cancelSubscription: () => void;
  unlockQuiz: (quizId: string) => void;
  removeCompletedQuiz: (quizId: string, completedAt: string) => void;
  undoRemove: (quizId: string, completedAt: string) => void;
  cleanupRecentlyDeleted: () => void;
  generateAndSetStudyPlan: () => Promise<void>;
  updateMissionStatus: (day: number, status: 'completed' | 'pending') => void;
  addFocusStory: (story: Omit<FocusStory, 'id' | 'date'>) => void;
  // Wellness Actions
  addOrUpdateCheckin: (checkinData: Partial<Omit<DailyCheckin, 'date'>> & { mood: Mood }) => void;
  addGratitudeEntry: (text: string) => void;
  addMindShiftEntry: (entry: Omit<MindShiftEntry, 'id' | 'date'>) => void;
  addHabit: (name: string, goal: number) => void;
  toggleHabit: (habitId: string) => void;
  addSleepEntry: (entry: Omit<SleepEntry, 'date'>) => void;
  // Notes Actions
  addNote: () => void;
  updateNote: (id: string, content: string, color: string) => void;
  deleteNote: (id: string) => void;
  // Coding Arena Actions
  addCodingSubmission: (submission: Omit<CodingSubmission, 'submittedAt'>) => void;
  useTimeTravelTicket: () => boolean;
  buyFocusCoins: (amount: number) => void;
  buyTimeTravelTicket: () => boolean;
}
const STORE_KEY = 'lumina-user-store';
const initialState = {
    currentUser: null,
    focusCoins: 100,
    subscriptionTier: 'free' as SubscriptionTier,
    completedQuizzes: [],
    recentlyDeleted: [],
    unlockedQuizIds: [],
    studyPlan: null,
    isPlanGenerating: false,
    focusStories: [],
    focusStreak: 0,
    lastFocusSessionDate: null,
    dailyCheckins: [],
    gratitudeEntries: [],
    mindShiftEntries: [],
    habits: [],
    sleepEntries: [ // Mock data for analytics
        { date: '2024-07-20', duration: 6.5, quality: 70 },
        { date: '2024-07-21', duration: 8, quality: 95 },
        { date: '2024-07-22', duration: 7.2, quality: 85 },
        { date: '2024-07-23', duration: 5, quality: 50 },
        { date: '2024-07-24', duration: 7.8, quality: 90 },
    ],
    notes: [],
    codingXP: 0,
    codingStreak: 0,
    lastCodingDate: null,
    timeTravelTickets: 1,
    codingSubmissions: [],
}
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setCurrentUser: (user) => {
        console.log('Setting current user:', user);
        set({ currentUser: user });
      },
      checkAuthStatus: () => {
        const authUser = auth.currentUser;
        console.log('Auth status check - Firebase user:', authUser);
        if (authUser) {
          const currentUser: CurrentUser = {
            uid: authUser.uid,
            email: authUser.email || '',
            displayName: authUser.displayName || 'User',
            photoURL: authUser.photoURL || `https://i.pravatar.cc/40?u=${authUser.uid}`
          };
          get().setCurrentUser(currentUser);
        } else {
          get().setCurrentUser(null);
        }
      },
      logoutUser: async () => {
          // *** THE FIX IS HERE ***
          // We only call the Firebase sign-out function.
          // The onAuthStateChanged listener in App.tsx is the single source of truth
          // and will be responsible for calling clearUser() after this completes.
          // This prevents a race condition and ensures a clean, predictable state update.
          await logOut();
      },
      clearUser: () => {
        set(initialState);
      },
      updateUserProfile: async (updates: UserProfileUpdate) => {
          const user = get().currentUser;
          if (!user) throw new Error("User not logged in");
          await fbUpdateUserProfile(updates);
          if (auth.currentUser) {
            const currentUser: CurrentUser = {
              uid: auth.currentUser.uid,
              email: auth.currentUser.email || '',
              displayName: auth.currentUser.displayName || 'User',
              photoURL: auth.currentUser.photoURL || `https://i.pravatar.cc/40?u=${auth.currentUser.uid}`
            };
            get().setCurrentUser(currentUser);
          }
      },
      addCompletedQuiz: (result) => {
        set((state) => {
          const otherQuizzes = state.completedQuizzes.filter(
            (q) => !(q.quizId === result.quizId && q.completedAt === result.completedAt)
          );
          return { completedQuizzes: [...otherQuizzes, result] };
        });
      },
      removeCompletedQuiz: (quizId, completedAt) => {
        const quizToRemove = get().completedQuizzes.find(q => q.quizId === quizId && q.completedAt === completedAt);
        if (quizToRemove) {
            const recentlyDeletedItem: RecentlyDeletedQuiz = { ...quizToRemove, deletedAt: Date.now() };
            set(state => ({
                completedQuizzes: state.completedQuizzes.filter(q => !(q.quizId === quizId && q.completedAt === completedAt)),
                recentlyDeleted: [...state.recentlyDeleted, recentlyDeletedItem]
            }));
        }
      },
      undoRemove: (quizId, completedAt) => {
          const quizToRestore = get().recentlyDeleted.find(q => q.quizId === quizId && q.completedAt === completedAt);
          if (quizToRestore) {
              const { deletedAt, ...originalQuiz } = quizToRestore;
              set(state => ({
                  completedQuizzes: [...state.completedQuizzes, originalQuiz],
                  recentlyDeleted: state.recentlyDeleted.filter(q => !(q.quizId === quizId && q.completedAt === completedAt))
              }));
          }
      },
      cleanupRecentlyDeleted: () => {
          const now = Date.now();
          const twoDaysInMs = 48 * 60 * 60 * 1000;
          set(state => ({
              recentlyDeleted: state.recentlyDeleted.filter(q => (now - q.deletedAt) < twoDaysInMs)
          }));
      },
      addCoins: (amount: number) => set((state) => ({ focusCoins: state.focusCoins + amount })),
      spendCoins: (amount: number) => {
        if (get().focusCoins >= amount) {
          set((state) => ({ focusCoins: state.focusCoins - amount }));
          return true;
        }
        return false;
      },
      upgradeSubscription: (tier) => set({ subscriptionTier: tier }),
      cancelSubscription: () => set({ subscriptionTier: 'free' }),
      unlockQuiz: (quizId: string) => {
          if(!get().unlockedQuizIds.includes(quizId)) {
              set(state => ({ unlockedQuizIds: [...state.unlockedQuizIds, quizId] }));
          }
      },
      generateAndSetStudyPlan: async () => {
          set({ isPlanGenerating: true });
          try {
              const { completedQuizzes, focusStories } = get();
              const getScoreFromCognitiveState = (result: CognitiveStateAnalysis | null): number => {
                if (!result) return 50; // Default score if no analysis
                switch (result.cognitive_state) {
                    case 'Deep Focus': return 95;
                    case 'Neutral': return 80;
                    case 'Slightly Distracted': return 60;
                    case 'Tired': return 50;
                    case 'Visibly Stressed': return 40;
                    default: return 50;
                }
              };
              const focusHistoryForPlan = focusStories.map(s => ({ 
                  id: s.id, 
                  date: s.date, 
                  duration: s.duration, 
                  score: getScoreFromCognitiveState(s.cognitiveStateResult) 
              }));
              const planData = await generateStudyPlan(completedQuizzes, focusHistoryForPlan);
              const planWithStatus: DailyMission[] = planData.map(mission => ({
                  ...mission,
                  status: 'pending'
              }));
              set({ studyPlan: planWithStatus, isPlanGenerating: false });
          } catch (error) {
              console.error("Failed to generate study plan:", error);
              set({ isPlanGenerating: false });
          }
      },
      updateMissionStatus: (day, status) => {
          set(state => {
              if (!state.studyPlan) return {};
              const updatedPlan = state.studyPlan.map(mission => 
                  mission.day === day ? { ...mission, status } : mission
              );
              if (status === 'completed' && !state.studyPlan.find(m => m.day === day)?.status.includes('completed')) {
                  return { studyPlan: updatedPlan, focusCoins: state.focusCoins + 10 };
              }
              return { studyPlan: updatedPlan };
          });
      },
      addFocusStory: (story) => {
        set(state => {
          const newStory: FocusStory = {
            ...story,
            id: `story-${Date.now()}`,
            date: new Date().toISOString(),
          };
          const updatedStories = [newStory, ...state.focusStories].slice(0, 10);
          const todayStr = toYYYYMMDD(new Date());
          let newStreak = state.focusStreak;
          if (state.lastFocusSessionDate !== todayStr) {
              if (state.lastFocusSessionDate && isYesterday(state.lastFocusSessionDate)) {
                newStreak += 1;
              } else {
                newStreak = 1;
              }
          }
          return { 
            focusStories: updatedStories,
            focusStreak: newStreak,
            lastFocusSessionDate: todayStr,
          };
        });
      },
      // Wellness Actions
      addOrUpdateCheckin: (checkinData) => {
        set(state => {
          const todayStr = toYYYYMMDD(new Date());
          const existingCheckinIndex = state.dailyCheckins.findIndex(c => c.date === todayStr);
          let newCheckins = [...state.dailyCheckins];
          let shouldReward = false;
          if (existingCheckinIndex > -1) {
            newCheckins[existingCheckinIndex] = { ...newCheckins[existingCheckinIndex], ...checkinData };
          } else {
            const newCheckin: DailyCheckin = {
                date: todayStr,
                mood: checkinData.mood,
                intention: checkinData.intention,
                reflection: checkinData.reflection,
            };
            newCheckins.push(newCheckin);
            shouldReward = true; // Reward only on the first checkin of the day
          }
          return { dailyCheckins: newCheckins, focusCoins: state.focusCoins + (shouldReward ? 5 : 0) };
        })
      },
      addGratitudeEntry: (text: string) => {
          set(state => {
            const newEntry: GratitudeEntry = {
                id: `gratitude-${Date.now()}`,
                date: new Date().toISOString(),
                text,
            };
            return {
                gratitudeEntries: [...state.gratitudeEntries, newEntry],
                focusCoins: state.focusCoins + 5
            };
          });
      },
      addMindShiftEntry: (entry: Omit<MindShiftEntry, 'id' | 'date'>) => {
          set(state => {
              const newEntry: MindShiftEntry = {
                  ...entry,
                  id: `mindshift-${Date.now()}`,
                  date: new Date().toISOString(),
              };
              return {
                  mindShiftEntries: [...state.mindShiftEntries, newEntry],
                  focusCoins: state.focusCoins + 10
              };
          })
      },
      addHabit: (name: string, goal: number) => {
        set(state => {
            const newHabit: Habit = {
                id: `habit-${Date.now()}`,
                name,
                goal,
                streak: 0,
                lastCompleted: null,
                createdAt: new Date().toISOString(),
            };
            return { habits: [...state.habits, newHabit] };
        });
      },
      toggleHabit: (habitId: string) => {
          set(state => {
              const todayStr = toYYYYMMDD(new Date());
              let coinsToAdd = 0;
              const updatedHabits = state.habits.map(h => {
                  if (h.id === habitId) {
                      // If already completed today, untoggle it (no penalty)
                      if (h.lastCompleted === todayStr) {
                          return { ...h, streak: h.streak - 1, lastCompleted: null };
                      }
                      // If not completed today, toggle it
                      let newStreak = h.streak;
                      if (h.lastCompleted && isYesterday(h.lastCompleted)) {
                          newStreak += 1;
                      } else {
                          newStreak = 1;
                      }
                      coinsToAdd = 5;
                      return { ...h, streak: newStreak, lastCompleted: todayStr };
                  }
                  return h;
              });
              return { habits: updatedHabits, focusCoins: state.focusCoins + coinsToAdd };
          });
      },
      addSleepEntry: (entry: Omit<SleepEntry, 'date'>) => {
        set(state => {
            const todayStr = toYYYYMMDD(new Date());
            const newEntry: SleepEntry = { ...entry, date: todayStr };
            const otherEntries = state.sleepEntries.filter(e => e.date !== todayStr);
            return {
                sleepEntries: [...otherEntries, newEntry]
            }
        });
      },
      // Notes Actions
      addNote: () => set(state => {
          const newNote: Note = {
              id: `note-${Date.now()}`,
              content: '',
              color: 'yellow',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
          };
          return { notes: [newNote, ...state.notes] };
      }),
      updateNote: (id: string, content: string, color: string) => set(state => ({
          notes: state.notes.map(note => 
              note.id === id ? { ...note, content, color, updatedAt: new Date().toISOString() } : note
          )
      })),
      deleteNote: (id: string) => set(state => ({
          notes: state.notes.filter(note => note.id !== id)
      })),
      // Coding Arena Actions
      addCodingSubmission: (submission: Omit<CodingSubmission, 'submittedAt'>) => {
        set((state) => {
          const fullSubmission: CodingSubmission = {
            ...submission,
            submittedAt: new Date().toISOString(),
          };
          let newXp = state.codingXP;
          let newStreak = state.codingStreak;
          let newCoins = state.focusCoins;
          let newLastCodingDate = state.lastCodingDate;
          const todayStr = toYYYYMMDD(new Date());
          if(submission.status === 'Accepted') {
            newXp += 25;
            newCoins += 20; 
            if (state.lastCodingDate !== todayStr) {
                if (state.lastCodingDate && isYesterday(state.lastCodingDate)) {
                    newStreak += 1;
                } else {
                    newStreak = 1;
                }
                newLastCodingDate = todayStr;
            }
          }
          return { 
            codingSubmissions: [...state.codingSubmissions, fullSubmission],
            codingXP: newXp,
            focusCoins: newCoins,
            codingStreak: newStreak,
            lastCodingDate: newLastCodingDate,
          };
        });
      },
      useTimeTravelTicket: () => {
        const state = get();
        if (state.timeTravelTickets > 0) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            set({
                timeTravelTickets: state.timeTravelTickets - 1,
                // By setting last coding date to yesterday, the next successful submission will continue the streak.
                lastCodingDate: toYYYYMMDD(yesterday),
                codingStreak: state.codingStreak + 1, // Mending implies restoring and continuing
            });
            return true;
        }
        return false;
      },
      buyFocusCoins: (amount: number) => {
          set(state => ({ focusCoins: state.focusCoins + amount }));
      },
      buyTimeTravelTicket: () => {
          const state = get();
          if (state.focusCoins >= TICKET_COST) {
              set({
                  focusCoins: state.focusCoins - TICKET_COST,
                  timeTravelTickets: state.timeTravelTickets + 1,
              });
              return true;
          }
          return false;
      }
    }),
    {
      name: 'lumina-user-store',
      storage: createJSONStorage(() => localStorage),
      version: 7, 
      partialize: (state) => {
        const { isPlanGenerating, ...rest } = state;
        return rest;
      },
      migrate: (persistedState: unknown, version: number) => {
        let state = persistedState as UserState & { focusStories: any[] };
        if (version < 7) {
            // This migrates old `emotionResult` based stories to the new `cognitiveStateResult` structure
            // to prevent crashes on viewing old data.
            state.focusStories = state.focusStories.map((story: any) => {
                if (story.emotionResult && !story.cognitiveStateResult) {
                    return {
                        ...story,
                        cognitiveStateResult: null, // Nullify old format
                        emotionResult: undefined,
                    };
                }
                return story;
            });
        }
        return state;
      },
    }
  )
);
