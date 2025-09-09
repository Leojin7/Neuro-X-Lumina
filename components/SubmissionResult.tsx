import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, AlertTriangle, ChevronDown } from 'lucide-react';
import type { SubmissionResult as SubmissionResultType } from '../types';
import Confetti from 'react-confetti';
interface SubmissionResultProps {
  result: SubmissionResultType | null;
  isExecuting: boolean;
  executionMode: 'run' | 'submit' | null;
}
const SubmissionResult = ({ result, isExecuting, executionMode }: SubmissionResultProps) => {
  const [activeTab, setActiveTab] = useState('results');
  const getStatusColor = (status: SubmissionResultType['status']) => {
    switch(status) {
        case 'Accepted': return 'text-success';
        case 'Wrong Answer': return 'text-destructive';
        case 'Time Limit Exceeded': return 'text-warning';
        case 'Runtime Error': return 'text-orange-400';
        case 'Running...': return 'text-blue-400';
        default: return 'text-muted-foreground';
    }
  }
  const getStatusIcon = (status: SubmissionResultType['status']) => {
    switch(status) {
        case 'Accepted': return <Check size={24} />;
        case 'Wrong Answer': return <X size={24} />;
        case 'Time Limit Exceeded': return <Clock size={24} />;
        case 'Runtime Error': return <AlertTriangle size={24} />;
        case 'Running...': return <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><Clock size={24} /></motion.div>;
        default: return null;
    }
  }
  const isSuccess = result?.status === 'Accepted' && executionMode === 'submit';
  return (
    <div className="bg-background h-full flex flex-col">
      {isSuccess && <Confetti recycle={false} numberOfPieces={200} gravity={0.1} />}
      <div className="flex-shrink-0 border-b border-border">
        <nav className="flex gap-4 px-4">
          <button 
            className={`py-2 px-2 font-semibold border-b-2 ${activeTab === 'results' ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'}`}
            onClick={() => setActiveTab('results')}
          >
            Result
          </button>
        </nav>
      </div>
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
            >
             {isExecuting ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><Clock size={32} /></motion.div>
                    <p className="mt-4 text-lg font-semibold">
                        {executionMode === 'run' ? 'Running against public tests...' : 'Submitting solution...'}
                    </p>
                </div>
             ) : !result ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <p className="text-lg">Run or submit your code to see the results.</p>
                </div>
             ) : (
                <div>
                  <div className={`flex items-center gap-3 p-4 rounded-lg bg-muted/40 mb-4 ${getStatusColor(result.status)}`}>
                      {getStatusIcon(result.status)}
                      <h2 className="text-2xl font-bold">{result.status}</h2>
                  </div>
                  <div className="space-y-2">
                    {result.details.map((detail, index) => (
                      <div key={index} className="bg-muted/20 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-foreground">Test Case {index + 1} {detail.testCase.isPublic ? '' : '(Hidden)'}</p>
                          {detail.passed ? (
                            <span className="flex items-center gap-1 text-sm text-success"><Check size={16}/> Passed</span>
                          ) : (
                            <span className="flex items-center gap-1 text-sm text-destructive"><X size={16}/> Failed</span>
                          )}
                        </div>
                        {!detail.passed && (
                            <div className="text-xs mt-2 space-y-1 text-muted-foreground bg-background/50 p-2 rounded-md font-mono">
                                <p><span className="font-semibold text-foreground">Input:</span> {JSON.stringify(detail.testCase.input)}</p>
                                <p><span className="font-semibold text-foreground">Expected:</span> {JSON.stringify(detail.testCase.expected)}</p>
                                <p><span className="font-semibold text-foreground">Your Output:</span> {JSON.stringify(detail.output)}</p>
                            </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
             )}
            </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
export default SubmissionResult;