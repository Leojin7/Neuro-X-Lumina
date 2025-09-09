import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Database, Shield, BarChart, FileText, Delete, Circle } from 'lucide-react';
const GlassCard = ({ children, className = "", delay = 0, title, icon }: { children: React.ReactNode; className?: string; delay?: number; title?: string; icon?: React.ReactNode }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay }}
        className={`rounded-3xl border border-border bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden ${className}`}
    >
        {title && (
            <div className="p-6 border-b border-border flex items-center gap-4">
                {icon}
                <h3 className="text-xl font-semibold text-foreground">{title}</h3>
            </div>
        )}
        <div className="p-6">{children}</div>
    </motion.div>
);
const InfoBlock = ({ title, children }: { title: string; children: React.ReactNode; }) => (
    <div>
        <h4 className="font-semibold text-lg text-foreground mb-2">{title}</h4>
        <div className="text-muted-foreground text-sm space-y-2">{children}</div>
    </div>
);
const Transparency: React.FC = () => {
    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden p-6">
            <div className="max-w-5xl mx-auto space-y-8">
                {}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 border border-border mb-6"
                    >
                        <Circle className="h-2 w-2 fill-primary/80" />
                        <span className="text-sm text-muted-foreground tracking-wide">
                            Ethical AI Framework
                        </span>
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Transparency & Ethics</h1>
                    <p className="text-lg text-muted-foreground max-w-3xl">
                        We believe in building AI that is transparent, fair, and accountable. Here’s how we handle your data and ensure our AI models are responsible.
                    </p>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {}
                    <GlassCard delay={0.3} title="Data Collection & Usage" icon={<Database className="text-primary" />}>
                        <InfoBlock title="What We Collect">
                            <p><strong>Interaction Data:</strong> Quiz scores, focus session durations, and feature usage to personalize your learning path.</p>
                            <p><strong>Content Data:</strong> Topics you generate quizzes on and goals you set to tailor AI suggestions.</p>
                            <p><strong>Anonymized Analytics:</strong> General usage patterns to improve NeuroLearn for everyone. We do not track personal information for analytics.</p>
                        </InfoBlock>
                    </GlassCard>
                    {}
                    <GlassCard delay={0.4} title="AI Fairness & Bias" icon={<Shield className="text-green-400" />}>
                        <InfoBlock title="Our Commitment">
                            <p>We are committed to mitigating bias in our AI systems. Our models are regularly audited to prevent unfair outcomes based on demographics or background.</p>
                            <p><strong>Fairness Score (Simulated):</strong> <span className="font-bold text-green-400">98.5%</span> - based on internal testing against benchmark datasets for equitable performance.</p>
                        </InfoBlock>
                    </GlassCard>
                    {}
                    <GlassCard delay={0.5} title="Explainable AI (XAI)" icon={<BarChart className="text-yellow-400" />}>
                        <InfoBlock title="Why This Recommendation?">
                            <p>We believe you should understand why our AI makes certain decisions. You'll find "Why?" tooltips on AI-generated content, like your daily study plan, explaining the reasoning.</p>
                            <p>For example: "This quiz was recommended because you scored lower on a related topic yesterday, offering a chance to reinforce your knowledge."</p>
                        </InfoBlock>
                    </GlassCard>
                    {}
                    <GlassCard delay={0.6} title="Your Data, Your Control" icon={<Delete className="text-red-400" />}>
                        <InfoBlock title="Data Management">
                            <p>You have the right to manage your data. While full data export and deletion are in development, you can manage your learning history in the app.</p>
                            <p className="font-semibold text-foreground">Data Sovereignty: All user data is stored securely on servers located in your region, ensuring compliance with local data protection laws.</p>
                        </InfoBlock>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};
export default Transparency;
