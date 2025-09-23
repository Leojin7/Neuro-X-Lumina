import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PortfolioProject, TimelineEvent, GitHubStats, LeetCodeStats, Integrations, Skill, GeneratedResumeContent } from '../types';
import { generateResumeContent } from '../services/geminiService';
interface PortfolioState {
    professionalTitle: string;
    bio: string;
    
    socialLinks: {
        github: string;
        linkedin: string;
        twitter: string;
    };
    skills: Skill[];
    projects: PortfolioProject[];
    timelineEvents: TimelineEvent[];
    githubStats: GitHubStats;
    leetcodeStats: LeetCodeStats;
    integrations: Integrations;
    isSyncing: boolean;
    generatedResume: GeneratedResumeContent | null;
    // Actions
    setProfileDetails: (details: Partial<Pick<PortfolioState, 'professionalTitle' | 'bio' | 'socialLinks'>>) => void;
    setIntegrations: (integrations: Integrations) => void;
    fetchAndSetStats: (api: { 
        fetchGithubData: (username: string) => Promise<{ stats: GitHubStats, projects: PortfolioProject[] } | null>,
        fetchLeetcodeData: (username: string) => Promise<LeetCodeStats | null>
    }) => Promise<void>;
    generateAndSetResume: () => Promise<void>;
}
const MOCK_PORTFOLIO_DATA = {
    professionalTitle: 'AI & Full-Stack Developer',
    bio: 'Innovating at the intersection of artificial intelligence and human-computer interaction. Passionate about building intelligent applications that are both powerful and beautiful. Open source contributor and lifelong learner.',
    socialLinks: {
        github: 'https://github.com/some-user',
        linkedin: 'https://linkedin.com/in/some-user',
        twitter: 'https://twitter.com/some-user',
    },
    skills: [
        { name: 'React', level: 95 },
        { name: 'TypeScript', level: 90 },
        { name: 'Node.js', level: 85 },
        { name: 'Python', level: 80 },
        { name: 'Gemini API', level: 92 },
        { name: 'Firebase', level: 88 },
        { name: 'Tailwind CSS', level: 98 },
        { name: 'UI/UX Design', level: 85 },
        { name: 'SQL', level: 75 },
        { name: 'Docker', level: 70 },
    ] as Skill[],
    projects: [
        {
            id: 'proj-1',
            title: 'NeuroLearn Platform',
            description: 'An intelligent learning platform combining adaptive quizzes, focus tracking, and cognitive wellness insights to enhance productivity.',
            techStack: ['React', 'TypeScript', 'Gemini AI', 'Zustand', 'Firebase'],
            imageUrl: 'https://plus.unsplash.com/premium_photo-1678565869434-c81195861939?q=80&w=800',
            repoUrl: '#',
            liveUrl: '#',
        },
    ],
    timelineEvents: [
        { id: 't-1', date: 'Jun 2024', title: 'Launched NeuroLearn Platform', description: 'Led the frontend development of the NeuroLearn intelligent learning application.', icon: 'Project' },
        { id: 't-2', date: 'Mar 2024', title: 'Gemini API Certification', description: 'Completed certification for Google\'s Gemini API, mastering multimodal and advanced prompting.', icon: 'Learn' },
    ] as TimelineEvent[],
    githubStats: { stars: 0, followers: 0, repos: 0 },
    leetcodeStats: { solved: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0, ranking: 0, totalEasy: 0, totalMedium: 0, totalHard: 0 },
    integrations: {
        leetcode: { username: '', visible: true },
        github: { visible: true },
    },
    isSyncing: false,
    generatedResume: null,
};
export const usePortfolioStore = create<PortfolioState>()(
    persist(
        (set, get) => ({
            ...MOCK_PORTFOLIO_DATA,
            setProfileDetails: (details) => set(state => ({
                ...state,
                ...details
            })),
            setIntegrations: (newIntegrations) => set(state => ({
                integrations: { ...state.integrations, ...newIntegrations }
            })),
            fetchAndSetStats: async (api) => {
                const { integrations, socialLinks } = get();
                set({ isSyncing: true });
                try {
                    const promises = [];
                    if (integrations.leetcode.visible && integrations.leetcode.username) {
                        promises.push(api.fetchLeetcodeData(integrations.leetcode.username));
                    } else {
                        promises.push(Promise.resolve(null));
                    }
                    if (integrations.github.visible && socialLinks.github) {
                        const githubUsername = socialLinks.github.split('/').pop() || '';
                        if (githubUsername) {
                            promises.push(api.fetchGithubData(githubUsername));
                        } else {
                            promises.push(Promise.resolve(null));
                        }
                    } else {
                         promises.push(Promise.resolve(null));
                    }
                    const [leetcodeResult, githubResult] = await Promise.all(promises);
                    set(state => ({
                        ...state,
                        leetcodeStats: leetcodeResult ?? state.leetcodeStats,
                        githubStats: githubResult?.stats ?? state.githubStats,
                        projects: githubResult?.projects ?? state.projects,
                    }));
                } catch (error) {
                    console.error("Failed to sync portfolio stats:", error);
                    // Optionally set an error state here
                } finally {
                    set({ isSyncing: false });
                }
            },
            generateAndSetResume: async () => {
                const { professionalTitle, bio, skills, projects, timelineEvents } = get();
                const portfolioData = { professionalTitle, bio, skills, projects, timelineEvents };
                try {
                    const resumeContent = await generateResumeContent(portfolioData);
                    set({ generatedResume: resumeContent });
                } catch (error) {
                    console.error("Failed to generate resume content:", error);
                    // maybe set an error state
                    throw error; // rethrow to be caught in component
                }
            },
        }),
        {
            name: 'lumina-portfolio-store',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
