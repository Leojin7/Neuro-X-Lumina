import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '../stores/useUserStore';
import { Plus, X, Palette } from 'lucide-react';
import type { Note } from '../types';
import Button from './Button';
const NOTE_COLORS = {
    yellow: 'bg-yellow-300/20 border-yellow-400/50 hover:border-yellow-400',
    blue: 'bg-blue-300/20 border-blue-400/50 hover:border-blue-400',
    green: 'bg-green-300/20 border-green-400/50 hover:border-green-400',
    pink: 'bg-pink-300/20 border-pink-400/50 hover:border-pink-400',
    purple: 'bg-purple-300/20 border-purple-400/50 hover:border-purple-400',
};
type NoteColor = keyof typeof NOTE_COLORS;
const NoteCard = ({ note }: { note: Note }) => {
    const { updateNote, deleteNote } = useUserStore();
    const [content, setContent] = useState(note.content);
    const [isColorPickerOpen, setColorPickerOpen] = useState(false);
    const handleBlur = () => {
        if (content !== note.content) {
            updateNote(note.id, content, note.color);
        }
    };
    const handleColorChange = (color: NoteColor) => {
        updateNote(note.id, note.content, color);
        setColorPickerOpen(false);
    }
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className={`relative p-4 rounded-xl shadow-lg border h-48 flex flex-col group ${NOTE_COLORS[note.color as NoteColor]}`}
        >
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onBlur={handleBlur}
                className="bg-transparent w-full h-full resize-none focus:outline-none text-foreground text-sm custom-scrollbar"
                placeholder="Start typing..."
            />
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="relative">
                     <button onClick={() => setColorPickerOpen(p => !p)} className="p-1 hover:bg-black/20 rounded-full">
                        <Palette size={14} />
                    </button>
                    <AnimatePresence>
                    {isColorPickerOpen && (
                        <motion.div
                             initial={{ opacity: 0, y: -10 }}
                             animate={{ opacity: 1, y: 0 }}
                             exit={{ opacity: 0, y: -10 }}
                             className="absolute right-0 mt-2 p-1 bg-background border border-border rounded-lg flex gap-1 z-10"
                        >
                            {Object.keys(NOTE_COLORS).map(color => (
                                <button key={color} onClick={() => handleColorChange(color as NoteColor)} className={`w-5 h-5 rounded-full ${NOTE_COLORS[color as NoteColor].split(' ')[0]}`}></button>
                            ))}
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
                <button onClick={() => deleteNote(note.id)} className="p-1 hover:bg-black/20 rounded-full">
                    <X size={14} />
                </button>
            </div>
        </motion.div>
    );
};
const NotesTaker = () => {
    const { notes, addNote } = useUserStore();
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-foreground">Quick Notes</h3>
                <Button onClick={addNote} size="sm">
                    <Plus size={16} className="mr-2" />
                    New Note
                </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <AnimatePresence>
                    {notes.map(note => (
                        <NoteCard key={note.id} note={note} />
                    ))}
                </AnimatePresence>
            </div>
             {notes.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed border-border rounded-xl text-muted-foreground">
                    <p>No notes yet.</p>
                    <p className="text-sm">Click 'New Note' to start jotting down your thoughts!</p>
                </div>
            )}
        </div>
    );
};
export default NotesTaker;