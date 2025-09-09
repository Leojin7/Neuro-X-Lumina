import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Trash2, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { toast } from 'react-hot-toast';
import * as gemini from '../services/geminiService';
interface StudyDay {
  day: number;
  date: string;
  topics: string[];
  completed: boolean;
}
const StudyRoadmap: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [days, setDays] = useState<StudyDay[]>([]);
  const [currentDay, setCurrentDay] = useState(0);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  // Load saved roadmap from localStorage
  useEffect(() => {
    const savedRoadmap = localStorage.getItem('studyRoadmap');
    if (savedRoadmap) {
      try {
        const parsed = JSON.parse(savedRoadmap);
        // Only load if the roadmap is from the current week
        if (parsed.weekStart === getStartOfWeek().toISOString()) {
          setDays(parsed.days);
        }
      } catch (e) {
        console.error('Failed to load saved roadmap', e);
      }
    }
  }, []);
  // Save roadmap to localStorage when it changes
  useEffect(() => {
    if (days.length > 0) {
      const roadmap = {
        weekStart: getStartOfWeek().toISOString(),
        days
      };
      localStorage.setItem('studyRoadmap', JSON.stringify(roadmap));
    }
  }, [days]);
  const getStartOfWeek = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };
  const generateWeekDates = () => {
    const startDate = getStartOfWeek();
    return Array(7).fill(0).map((_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      return {
        day: i + 1,
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        topics: [],
        completed: false
      } as StudyDay;
    });
  };
  const handleGenerateRoadmap = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter what you want to learn');
      return;
    }
    setIsGenerating(true);
    try {
      const generatedRoadmap = await gemini.generateStudyRoadmap(prompt);
      // If we get a valid response, update the days
      if (generatedRoadmap && generatedRoadmap.days) {
        const weekDates = generateWeekDates();
        const updatedDays = weekDates.map((day, index) => ({
          ...day,
          topics: generatedRoadmap.days[index]?.topics || []
        }));
        setDays(updatedDays);
        setCurrentDay(0);
        toast.success('Study roadmap generated!');
      } else {
        throw new Error('Invalid roadmap format');
      }
    } catch (error) {
      console.error('Error generating roadmap:', error);
      toast.error('Failed to generate study roadmap. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  const handleAddTopic = () => {
    if (newTopic.trim()) {
      const updatedDays = [...days];
      updatedDays[currentDay].topics.push(newTopic.trim());
      setDays(updatedDays);
      setNewTopic('');
      setIsAddingTopic(false);
    }
  };
  const handleDeleteTopic = (topicIndex: number) => {
    const updatedDays = [...days];
    updatedDays[currentDay].topics.splice(topicIndex, 1);
    setDays(updatedDays);
  };
  const toggleTopicComplete = (topicIndex: number) => {
    const updatedDays = [...days];
    const topic = updatedDays[currentDay].topics[topicIndex];
    // Toggle completion by adding/removing strikethrough
    if (topic.startsWith('~~') && topic.endsWith('~~')) {
      updatedDays[currentDay].topics[topicIndex] = topic.slice(2, -2);
    } else {
      updatedDays[currentDay].topics[topicIndex] = `~~${topic}~~`;
    }
    setDays(updatedDays);
  };
  const startEditing = (topicIndex: number) => {
    setEditText(days[currentDay].topics[topicIndex].replace(/~~/g, ''));
    setIsEditing(topicIndex);
  };
  const saveEdit = () => {
    if (isEditing !== null && editText.trim()) {
      const updatedDays = [...days];
      updatedDays[currentDay].topics[isEditing] = editText.trim();
      setDays(updatedDays);
      setIsEditing(null);
    }
  };
  const cancelEdit = () => {
    setIsEditing(null);
    setEditText('');
  };
  const handleDayComplete = () => {
    const updatedDays = [...days];
    updatedDays[currentDay].completed = !updatedDays[currentDay].completed;
    setDays(updatedDays);
  };
  const completedTopicsCount = days[currentDay]?.topics.filter(topic => topic.startsWith('~~') && topic.endsWith('~~')).length || 0;
  const totalTopics = days[currentDay]?.topics.length || 0;
  const progress = totalTopics > 0 ? Math.round((completedTopicsCount / totalTopics) * 100) : 0;
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <CalendarIcon className="text-primary" />
            Study Roadmap
          </h3>
          <p className="text-sm text-muted-foreground">
            {days.length > 0 
              ? `Week of ${new Date(getStartOfWeek()).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
              : 'Generate a 7-day study plan based on your goals'}
          </p>
        </div>
        {days.length > 0 && (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setDays([])}
              className="text-xs"
            >
              Clear Roadmap
            </Button>
          </div>
        )}
      </div>
      {days.length === 0 ? (
        <div className="space-y-4">
          <div className="relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What do you want to learn? (e.g., 'Learn React in 7 days', 'Prepare for AWS certification')"
              className="min-h-[100px] bg-background/50 backdrop-blur-sm"
              disabled={isGenerating}
            />
          </div>
          <Button
            onClick={handleGenerateRoadmap}
            disabled={isGenerating || !prompt.trim()}
            className="w-full sm:w-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate 7-Day Plan
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentDay((prev) => (prev > 0 ? prev - 1 : 6))}
              disabled={currentDay === 0}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="text-center">
              <h4 className="font-medium">
                {days[currentDay]?.date}
                {days[currentDay]?.completed && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    Completed
                  </span>
                )}
              </h4>
              <p className="text-sm text-muted-foreground">
                Day {currentDay + 1} of 7 • {progress}% complete
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentDay((prev) => (prev < 6 ? prev + 1 : 0))}
              disabled={currentDay === 6}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          {}
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          {}
          <div className="space-y-2">
            {days[currentDay]?.topics.length > 0 ? (
              <ul className="space-y-2">
                {days[currentDay].topics.map((topic, index) => {
                  const isCompleted = topic.startsWith('~~') && topic.endsWith('~~');
                  const displayText = isCompleted ? topic.slice(2, -2) : topic;
                  return (
                    <li key={index} className="flex items-start gap-2 group">
                      <button
                        onClick={() => toggleTopicComplete(index)}
                        className={`flex-shrink-0 mt-1 w-5 h-5 rounded-full border ${isCompleted ? 'bg-primary border-primary' : 'border-border'} flex items-center justify-center`}
                        aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {isCompleted && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                      </button>
                      {isEditing === index ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="flex-1 bg-background border border-input rounded px-2 py-1 text-sm"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          />
                          <Button variant="ghost" size="sm" onClick={saveEdit}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={cancelEdit}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex-1 group-hover:bg-muted/50 rounded px-2 py-1 -mx-2">
                          <button
                            onClick={() => startEditing(index)}
                            className={`text-left w-full ${isCompleted ? 'line-through text-muted-foreground' : ''}`}
                          >
                            {displayText}
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => handleDeleteTopic(index)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-1 -mr-2"
                        aria-label="Delete topic"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No topics planned for today.</p>
              </div>
            )}
            {isAddingTopic ? (
              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="Enter a topic or task"
                  className="flex-1 bg-background border border-input rounded px-3 py-2 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
                  autoFocus
                />
                <Button variant="outline" size="sm" onClick={handleAddTopic}>
                  Add
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsAddingTopic(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-primary"
                onClick={() => setIsAddingTopic(true)}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Topic
              </Button>
            )}
          </div>
          {}
          <div className="pt-4 border-t border-border">
            <Button
              variant={days[currentDay]?.completed ? 'outline' : 'default'}
              size="sm"
              className="w-full"
              onClick={handleDayComplete}
            >
              {days[currentDay]?.completed ? 'Mark as Incomplete' : 'Mark Day as Complete'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
export default StudyRoadmap;
