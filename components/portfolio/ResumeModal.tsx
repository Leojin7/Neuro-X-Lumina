import React, { MouseEvent, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../../stores/useUserStore';
import { usePortfolioStore } from '../../stores/usePortfolioStore';
import Button from '../Button';
import { X, Download, Linkedin, Github, Mail, Briefcase, Code, Star, ChevronsRight, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

const BulletPoint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex gap-2.5 items-start">
        <ChevronsRight size={14} className="text-teal-600 mt-1 flex-shrink-0" />
        <span className="text-gray-700">{children}</span>
    </li>
);
interface ResumeModalProps {
    isOpen: boolean;
    onClose: () => void;
}
const ResumeModal = ({ isOpen, onClose }: ResumeModalProps) => {
    const { currentUser } = useUserStore();
    const { professionalTitle, skills, socialLinks, generatedResume } = usePortfolioStore();
    const resumeRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const handleDownload = () => {
        if (!resumeRef.current) return;
        setIsDownloading(true);
        html2canvas(resumeRef.current, {
            scale: 3,
            useCORS: true,
            backgroundColor: '#ffffff',
        }).then((canvas) => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `${currentUser?.displayName?.replace(' ', '-')}-Resume.png`;
            link.click();
        }).finally(() => {
            setIsDownloading(false);
        });
    };

    if (!currentUser || !generatedResume) return null;

    const Section = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
        <section className="mt-6">
            <h3 className="flex items-center gap-3 text-lg font-bold text-gray-800 border-b-2 border-gray-200 pb-1 mb-3">
                {icon}
                {title}
            </h3>
            {children}
        </section>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="relative bg-card backdrop-blur-xl border border-border rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col"
                        onClick={(e: MouseEvent) => e.stopPropagation()}
                    >
                        <header className="flex-shrink-0 p-4 flex justify-between items-center border-b border-border">
                            <h2 className="text-xl font-bold text-foreground">Your AI-Crafted Resume</h2>
                            <div className="flex gap-2">
                                <Button variant="primary" onClick={handleDownload} disabled={isDownloading}>
                                    {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                    <span className="ml-2">Download PNG</span>
                                </Button>
                                <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground"><X size={24} /></button>
                            </div>
                        </header>
                        <div className="flex-1 overflow-y-auto p-4 bg-muted">
                            <div ref={resumeRef} className="w-full max-w-[210mm] mx-auto bg-white text-gray-800 p-10 shadow-lg font-sans text-[11pt] leading-relaxed">
                                <header className="text-center border-b-2 border-gray-200 pb-4">
                                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{currentUser.displayName}</h1>
                                    <h2 className="text-xl font-medium text-teal-600 mt-1">{professionalTitle}</h2>
                                    <div className="flex justify-center items-center gap-x-6 gap-y-1 text-xs mt-3 flex-wrap text-gray-600">
                                        <a href={`mailto:${currentUser.email}`} className="flex items-center gap-1.5 hover:text-teal-600 transition-colors"><Mail size={12} /> {currentUser.email}</a>
                                        <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-teal-600 transition-colors"><Linkedin size={12} /> {socialLinks.linkedin.replace('https://www.', '')}</a>
                                        <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-teal-600 transition-colors"><Github size={12} /> {socialLinks.github.replace('https://www.', '')}</a>
                                    </div>
                                </header>
                                <main className="mt-6">
                                    <Section title="Professional Summary" icon={<Star size={18} className="text-teal-600" />}>
                                        <p className="text-sm text-gray-700">{generatedResume.summary}</p>
                                    </Section>
                                    <Section title="Technical Skills" icon={<Star size={18} className="text-teal-600" />}>
                                        <p className="text-sm text-gray-700 text-center">
                                            {skills.map(skill => skill.name).join('  •  ')}
                                        </p>
                                    </Section>
                                    <Section title="Professional Experience" icon={<Briefcase size={18} className="text-teal-600" />}>
                                        <div className="space-y-5">
                                            {generatedResume.experience.map((exp, i) => (
                                                <div key={i}>
                                                    <div className="flex justify-between items-baseline">
                                                        <h4 className="text-md font-bold text-gray-800">{exp.title}</h4>
                                                        <p className="text-sm font-medium text-gray-500">{exp.date}</p>
                                                    </div>
                                                    <ul className="mt-1.5 text-sm list-inside space-y-1.5">
                                                        {exp.bulletPoints.map((bp, j) => <BulletPoint key={j}>{bp}</BulletPoint>)}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </Section>
                                    <Section title="Projects" icon={<Code size={18} className="text-teal-600" />}>
                                        <div className="space-y-5">
                                            {generatedResume.projects.map((proj, i) => (
                                                <div key={i}>
                                                    <div className="flex justify-between items-baseline">
                                                        <h4 className="text-md font-bold text-gray-800">{proj.title}</h4>
                                                    </div>
                                                    <p className="text-xs font-semibold text-teal-700/80 mt-1">Tech Stack: {proj.techStack.join(', ')}</p>
                                                    <ul className="mt-1.5 text-sm list-inside space-y-1.5">
                                                        {proj.bulletPoints.map((bp, j) => <BulletPoint key={j}>{bp}</BulletPoint>)}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </Section>
                                </main>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
export default ResumeModal;