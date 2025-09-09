
declare global {
  interface Window {
    firebaseConfig: {
      apiKey: string;
      authDomain: string;
      projectId: string;
      storageBucket: string;
      messagingSenderId: string;
      appId: string;
    };
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
import type React from 'react';
export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
}
export interface Quiz {
  id:string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questions: Question[];
  tags: string[];
  isPremium?: boolean;
}
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: 'Zap' | 'BrainCircuit' | 'Target';
  achieved: boolean;
}
export interface FocusSession {
  id: string;
  date: string;
  duration: number; // in minutes
  score: number; // 0-100
}
export interface QuizResult {
  quizId: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  score: number; // 0-100
  completedAt: string; // ISO string
}
export interface RecentlyDeletedQuiz extends QuizResult {
    deletedAt: number; // timestamp
}
export interface CognitiveStateAnalysis {
  cognitive_state: "Deep Focus" | "Neutral" | "Slightly Distracted" | "Visibly Stressed" | "Tired";
  confidence_score: number;
  key_indicators: string[];
  actionable_advice_id: string;
}
export interface AudioEnvironmentAnalysis {
  environment_quality: "Optimal" | "Acceptable" | "Distracting";
  primary_distraction: string;
  suggestion_id: "SUGGEST_SOUNDSCAPE" | "SUGGEST_HEADPHONES" | "SUGGEST_NOTHING";
}
export interface FocusStory {
    id: string;
    date: string; // ISO string
    duration: number; // in minutes
    coinsEarned: number;
    cognitiveStateResult: CognitiveStateAnalysis | null;
    flowState: number; // 0-100%
    cognitiveLoad: 'low' | 'medium' | 'high';
}
export type SubscriptionTier = 'free' | 'pro' | 'elite';
export interface CurrentUser {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    creationTime?: string;
}
export interface DailyMission {
  day: number;
  title: string;
  description: string;
  activityType: 'quiz' | 'focus' | 'review' | 'generate';
  activityTarget: string; // e.g., Quiz title, topic, or duration
  status: 'pending' | 'completed';
  reasoning?: string;
}
export type Mood = 'awful' | 'bad' | 'ok' | 'good' | 'great';
export interface DailyCheckin {
  date: string; // YYYY-MM-DD
  mood: Mood;
  intention?: string;
  reflection?: string;
}
export interface GratitudeEntry {
  id: string;
  date: string; // ISO string
  text: string;
}
export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export interface MindShiftEntry {
  id: string;
  date: string; // ISO string
  negativeThought: string;
  reframe: string;
  category: string;
  moodBefore: MoodLevel;
  moodAfter: MoodLevel;
}
export interface Habit {
  id: string;
  name: string;
  goal: number; // e.g., 30 days
  streak: number;
  lastCompleted: string | null; // YYYY-MM-DD
  createdAt: string;
}
export interface SleepEntry {
  date: string; // YYYY-MM-DD
  duration: number; // in hours
  quality: number; // 1-100
}
export interface Note {
  id: string;
  content: string;
  color: string; // e.g., 'yellow', 'blue', 'green'
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}
// Types for Coding Arena
export type Language = 'javascript' | 'python' | 'java' | 'cpp' | 'c';
export interface TestCase {
    input: any[];
    expected: any;
    isPublic: boolean;
}
export interface CodingProblem {
    id: string;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    topic: string;
    description: string;
    functionSignature: string;
    starterCode: Partial<Record<Language, string>>;
    testCases: TestCase[];
}
export interface SubmissionResultDetail {
    testCase: TestCase;
    passed: boolean;
    output: any;
}
export interface SubmissionResult {
    status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error' | 'Running...';
    passedCount: number;
    totalCount: number;
    details: SubmissionResultDetail[];
}
export interface CodingSubmission {
    problemId: string;
    submittedAt: string; // ISO string
    status: 'Accepted' | 'Wrong Answer'; // Simplified for history
    language: Language;
}
// Types for Study Squads
export interface SquadMember {
  uid: string;
  displayName: string;
  photoURL: string;
}
export interface SquadMessage {
  id: string;
  author: SquadMember;
  content: string; // This will be the encrypted content
  timestamp: string;
  isAIMessage?: boolean;
}
export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  image?: {
    mimeType: string;
    data: string; // base64 string
  };
  status?: 'loading' | 'error';
}
export interface SquadTimerState {
    mode: 'pomodoro' | 'shortBreak' | 'longBreak';
    timeLeft: number;
    isActive: boolean;
}
export interface StudySquad {
  id: string;
  name:string;
  topic: string;
  hostId: string;
  members: SquadMember[];
  messages: SquadMessage[];
  timerState: SquadTimerState;
  isPrivate: boolean;
  createdAt: string;
  joinCode: string;
}
export interface Integrations {
    leetcode: {
        username: string;
        visible: boolean;
    };
    github: {
        visible: boolean;
    };
}
// Types for Portfolio Module
export interface PortfolioProject {
    id: string | number;
    title: string;
    description: string;
    techStack: string[];
    imageUrl: string;
    repoUrl?: string;
    liveUrl?: string;
}
export interface Skill {
    name: string;
    level: number; // 0-100
}
export interface TimelineEvent {
    id: string;
    date: string;
    title: string;
    description: string;
    icon: 'Milestone' | 'Project' | 'Learn' | 'Job';
}
export interface GitHubStats {
    stars: number;
    followers: number;
    repos: number;
}
export interface LeetCodeStats {
    solved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    ranking: number;
    totalEasy?: number;
    totalMedium?: number;
    totalHard?: number;
}
// Types for AI-Generated Resume
export interface GeneratedExperience {
    title: string;
    date: string;
    bulletPoints: string[];
}
export interface GeneratedProject {
    title: string;
    techStack: string[];
    bulletPoints: string[];
}
export interface GeneratedResumeContent {
    summary: string;
    experience: GeneratedExperience[];
    projects: GeneratedProject[];
}
// Types for Agent Hub
export type AgentType = 'research' | 'presentation';
export interface Agent {
  id: AgentType;
  name: string;
  description: string;
  icon: React.ElementType; // Lucide icon component
  color: string;
  accentColor: string;
}
export interface AgentExecutionResult {
    text?: string;
    sources?: { web: { uri: string; title: string } }[];
    presentation?: { slideTitle: string; bulletPoints: string[] }[];
}
export interface Task {
  id: string;
  text: string;
  status: 'todo' | 'in_progress' | 'completed' | 'error';
  result?: AgentExecutionResult;
  assignedAgent?: AgentType;
}
// Types for NotebookLM
export interface NotebookSlide {
  title: string;
  points: string[];
  narration: string;
}
export interface NotebookScript {
  summary: string;
  slides: NotebookSlide[];
}
