import React from 'react';
import { motion } from 'framer-motion';
import type { PortfolioProject } from '../../types';
import Card from '../Card';
import { ExternalLink, Github } from 'lucide-react';
interface ProjectShowcaseProps {
    projects: PortfolioProject[];
}
const ProjectCard = ({ project, index }: { project: PortfolioProject, index: number }) => {
    return (
        <motion.div
            className="bg-muted/60 rounded-2xl border border-border overflow-hidden group relative"
            {...{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { delay: index * 0.1, type: 'spring', stiffness: 120 },
            } as any}
        >
            <div className="h-40 overflow-hidden">
                <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <div className="p-4">
                <h3 className="text-lg font-bold text-foreground">{project.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 h-10 overflow-hidden text-ellipsis">{project.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                    {project.techStack.map(tech => (
                        <span key={tech} className="text-xs font-semibold text-primary bg-primary/20 px-2 py-1 rounded-full">{tech}</span>
                    ))}
                </div>
            </div>
            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {project.repoUrl && (
                    <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-card/80 rounded-full text-muted-foreground hover:text-foreground backdrop-blur-sm">
                        <Github size={18}/>
                    </a>
                )}
                 {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-card/80 rounded-full text-muted-foreground hover:text-foreground backdrop-blur-sm">
                        <ExternalLink size={18}/>
                    </a>
                )}
            </div>
        </motion.div>
    )
}
const ProjectShowcase: React.FC<ProjectShowcaseProps> = ({ projects }) => {
    return (
        <Card title="Featured Projects" className="h-full">
            <div className="space-y-4 max-h-[30rem] overflow-y-auto pr-2 custom-scrollbar">
                {projects.map((project, index) => (
                    <ProjectCard key={project.id} project={project} index={index} />
                ))}
                 {projects.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        <p>No projects to display.</p>
                        <p className="text-sm">Connect your GitHub to see your projects here.</p>
                    </div>
                 )}
            </div>
        </Card>
    );
};
export default ProjectShowcase;