import type { GitHubStats, LeetCodeStats, PortfolioProject } from '../types';
export const fetchGithubData = async (username: string): Promise<{ stats: GitHubStats, projects: PortfolioProject[] } | null> => {
    try {
        const [userRes, reposRes] = await Promise.all([
            fetch(`https://api.github.com/users/${username}`),
            fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`)
        ]);
        if (!userRes.ok || !reposRes.ok) {
            console.error(`GitHub API error: User=${userRes.status}, Repos=${reposRes.status}`);
            return null;
        }
        const userData = await userRes.json();
        const reposData = await reposRes.json();
        const totalStars = reposData.reduce((acc: number, repo: any) => acc + repo.stargazers_count, 0);
        const stats: GitHubStats = {
            stars: totalStars,
            followers: userData.followers || 0,
            repos: userData.public_repos || 0,
        };
        const projects: PortfolioProject[] = reposData
            .sort((a: any, b: any) => b.stargazers_count - a.stargazers_count) // Sort by stars
            .slice(0, 5) // Take top 5
            .map((repo: any) => ({
                id: repo.id,
                title: repo.name,
                description: repo.description || 'No description available.',
                techStack: [repo.language].filter(Boolean), // Only add language if it exists
                imageUrl: `https://raw.githubusercontent.com/${username}/${repo.name}/main/screenshot.png`, // Placeholder, would need a better solution
                repoUrl: repo.html_url,
                liveUrl: repo.homepage || undefined,
            }));
        return { stats, projects };
    } catch (error) {
        console.error("Failed to fetch GitHub data:", error);
        return null;
    }
};
export const fetchLeetcodeData = async (username: string): Promise<LeetCodeStats | null> => {
    try {
        // Replaced deprecated Heroku API with a working Vercel-hosted one.
        const response = await fetch(`https://leetcode-stats-api.vercel.app/${username}`);
        if (!response.ok || response.status === 404) {
             console.error(`LeetCode API error: Status=${response.status}`);
             return null;
        }
        const data = await response.json();
        if (data.status === 'error') {
            console.error(`LeetCode API error: ${data.message}`);
            return null;
        }
        const stats: LeetCodeStats = {
            solved: data.totalSolved || 0,
            easySolved: data.easySolved || 0,
            mediumSolved: data.mediumSolved || 0,
            hardSolved: data.hardSolved || 0,
            ranking: data.ranking > 0 ? data.ranking : 0, // Ensure ranking is not negative
            totalEasy: data.totalEasy || 0,
            totalMedium: data.totalMedium || 0,
            totalHard: data.totalHard || 0,
        };
        return stats;
    } catch (error) {
        console.error("Failed to fetch LeetCode data:", error);
        return null;
    }
};