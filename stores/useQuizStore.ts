import { create } from 'zustand';
import type { Quiz } from '../types';
const MOCK_QUIZZES: Quiz[] = [
  {
    id: 'react-basics',
    title: 'React.js Basics',
    description: 'Test your knowledge of fundamental React concepts.',
    difficulty: 'Easy',
    tags: ['React', 'JavaScript', 'Frontend'],
    isPremium: false,
    questions: [
      { id: 'q1', text: 'What is JSX?', options: ['A JavaScript syntax extension', 'A CSS preprocessor', 'A database query language', 'A state management library'], correctAnswer: 'A JavaScript syntax extension' },
      { id: 'q2', text: 'Which hook is used to manage state in a functional component?', options: ['useEffect', 'useState', 'useContext', 'useReducer'], correctAnswer: 'useState' },
      { id: 'q3', text: 'How do you pass data from a parent to a child component?', options: ['Using state', 'Using context', 'Using props', 'Using refs'], correctAnswer: 'Using props' },
      { id: 'q4', text: 'What does `useEffect` do?', options: ['Manages component state', 'Performs side effects', 'Renders JSX', 'Handles routing'], correctAnswer: 'Performs side effects' },
    ],
  },
  {
    id: 'js-advanced',
    title: 'Advanced JavaScript',
    description: 'Dive into closures, prototypes, and asynchronous JavaScript.',
    difficulty: 'Medium',
    tags: ['JavaScript', 'Advanced'],
    isPremium: false,
    questions: [
      { id: 'q1', text: 'What is a closure?', options: ['A function bundled with its lexical environment', 'A type of loop', 'An object prototype', 'A way to handle errors'], correctAnswer: 'A function bundled with its lexical environment' },
      { id: 'q2', text: 'What is the output of `typeof null`?', options: ['"null"', '"undefined"', '"object"', '"number"'], correctAnswer: '"object"' },
      { id: 'q3', text: 'Which of these is NOT a way to handle async operations?', options: ['Callbacks', 'Promises', 'Async/Await', 'Sync/Wait'], correctAnswer: 'Sync/Wait' },
    ],
  },
  {
    id: 'tailwind-css',
    title: 'Tailwind CSS Fundamentals',
    description: 'Assess your skills with the popular utility-first CSS framework.',
    difficulty: 'Easy',
    tags: ['CSS', 'Tailwind CSS', 'Frontend'],
    isPremium: false,
    questions: [
      { id: 'q1', text: 'How do you apply a flexbox layout in Tailwind?', options: ['class="display-flex"', 'class="flex"', 'class="layout-flex"', 'class="use-flex"'], correctAnswer: 'class="flex"' },
      { id: 'q2', text: 'Which class sets the text color to red?', options: ['class="color-red-500"', 'class="font-red-500"', 'class="text-red-500"', 'class="red-text-500"'], correctAnswer: 'class="text-red-500"' },
    ],
  },
   {
    id: 'cognitive-bias',
    title: 'Cognitive Biases',
    description: 'Explore common pitfalls in human thinking.',
    difficulty: 'Hard',
    tags: ['Psychology', 'Wellness'],
    isPremium: true,
    questions: [
      { id: 'q1', text: 'What is Confirmation Bias?', options: ['Favoring information that confirms existing beliefs', 'Overestimating one\'s own abilities', 'The tendency to rely on the first piece of info', 'Assuming others share your beliefs'], correctAnswer: 'Favoring information that confirms existing beliefs' },
      { id: 'q2', text: 'The Dunning-Kruger effect describes...', options: ['Fear of missing out', 'A cognitive bias where people with low ability at a task overestimate their ability', 'A preference for the current state of affairs', 'A memory error'], correctAnswer: 'A cognitive bias where people with low ability at a task overestimate their ability' },
    ],
  }
];
interface QuizState {
  quizzes: Quiz[];
  addQuiz: (quiz: Quiz) => void;
  getQuizById: (id: string) => Quiz | undefined;
}
export const useQuizStore = create<QuizState>((set, get) => ({
  quizzes: MOCK_QUIZZES,
  addQuiz: (quiz) => set((state) => ({ quizzes: [quiz, ...state.quizzes] })),
  getQuizById: (id: string) => {
    return get().quizzes.find((q) => q.id === id);
  },
}));
