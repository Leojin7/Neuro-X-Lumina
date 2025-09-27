import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../Button';

import { Sparkles, FileText, Loader2 } from 'lucide-react';
import Card from '../Card';
import ResumeModal from './ResumeModal';
import { usePortfolioStore } from '../../stores/usePortfolioStore';

const ResumeGenerator = () => {
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const generateAndSetResume = usePortfolioStore(state => state.generateAndSetResume);
    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            
            await generateAndSetResume();
            setIsModalOpen(true);
        } catch (error) {
            alert("Sorry, there was an error generating your resume. Please try again.");
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };
    return (
        <>
            <Card title="AI Resume Builder" className="h-full">
                <div className="flex flex-col items-center justify-center text-center h-full">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground mb-6 shadow-lg shadow-primary/20">
                         <FileText size={48} />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Instantly Generate Your Resume</h3>
                    <p className="text-sm text-muted-foreground mt-2 mb-6">Let our AI craft a professional resume from your portfolio data in seconds.</p>
                    <Button
                        variant="accent"
                        size="lg"
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="w-full"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Generating...
                            </>
                        ) : (
                             <>
                                <Sparkles size={20} />
                                Generate Resume
                            </>
                        )}
                    </Button>
                </div>
            </Card>
            <ResumeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};
export default ResumeGenerator;
