import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Wind, ArrowLeft } from 'lucide-react';
import Button from '../Button';
type HubState = 'initial' | 'crisis' | 'overwhelmed';
const SupportHub = () => {
    const [state, setState] = useState<HubState>('initial');
    const GroundingExercise = () => (
        <div className="space-y-4 text-left">
             <h3 className="text-2xl font-bold text-white">5-4-3-2-1 Grounding Exercise</h3>
             <p className="text-white/70">Let's ground ourselves in the present moment. Follow these steps slowly.</p>
             <ul className="space-y-3 text-white/90 list-decimal list-inside">
                <li><strong>Acknowledge 5 things you can see around you.</strong> It could be a pen, a spot on the ceiling, anything in your surroundings.</li>
                <li><strong>Acknowledge 4 things you can touch around you.</strong> It could be your skin, a table, the fabric of your clothes.</li>
                <li><strong>Acknowledge 3 things you can hear.</strong> This could be any external sound. If you can hear your belly rumbling, that counts!</li>
                <li><strong>Acknowledge 2 things you can smell.</strong> Maybe you are in your office and smell pencil, or maybe you are in your bedroom and smell a pillow.</li>
                <li><strong>Acknowledge 1 thing you can taste.</strong> What does the inside of your mouth taste like—gum, coffee, or the sandwich you had for lunch?</li>
             </ul>
        </div>
    );
    const CrisisResources = () => (
        <div className="space-y-4 text-left">
             <h3 className="text-2xl font-bold text-red-400">Immediate Help Resources</h3>
             <p className="text-white/70">If you are in immediate danger or crisis, please contact one of these 24/7 hotlines. You are not alone.</p>
             <div className="space-y-3">
                <div>
                    <p className="font-bold text-white">National Suicide Prevention Lifeline</p>
                    <a href="tel:988" className="text-lg text-blue-400 hover:underline font-semibold">Call or Text 988</a>
                </div>
                 <div>
                    <p className="font-bold text-white">Crisis Text Line</p>
                    <p className="text-lg text-white/90 font-semibold">Text HOME to 741741</p>
                </div>
             </div>
             <p className="text-sm text-white/60 pt-4 border-t border-white/10">NeuroLearn is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider.</p>
        </div>
    );
    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={state}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        {state === 'initial' && (
                            <div className="text-center">
                                <div className="inline-block p-3 rounded-full bg-red-500/20 mb-4">
                                    <Phone className="h-8 w-8 text-red-400" />
                                </div>
                                <h2 className="text-3xl font-bold text-white">It's okay to not be okay.</h2>
                                <p className="text-white/70 text-lg max-w-2xl mx-auto mt-2 mb-8">
                                    I am an AI, but I can help you connect with a human or guide you through a calming exercise. How are you feeling right now?
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button onClick={() => setState('crisis')} size="lg" className="bg-red-600/90 hover:bg-red-600">
                                        I'm in crisis and need help now
                                    </Button>
                                    <Button onClick={() => setState('overwhelmed')} size="lg" variant="secondary">
                                        <Wind className="mr-2" />
                                        I'm overwhelmed and need to calm down
                                    </Button>
                                </div>
                            </div>
                        )}
                        {state !== 'initial' && (
                             <div>
                                <Button onClick={() => setState('initial')} variant="ghost" className="mb-6">
                                    <ArrowLeft className="mr-2" /> Back
                                </Button>
                                {state === 'crisis' && <CrisisResources />}
                                {state === 'overwhelmed' && <GroundingExercise />}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};
export default SupportHub;
