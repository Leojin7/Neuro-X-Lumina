
import { create } from 'zustand';
import { processAssistantRequest, getAssistantStream } from '../services/geminiService';
import type { ChatMessage } from '../types';
import toast from 'react-hot-toast';
interface AssistantState {
  isOpen: boolean;
  messages: ChatMessage[];
  
  toggleAssistant: () => void;
  sendMessage: (prompt: string, image?: { mimeType: string, data: string }) => Promise<void>;
  regenerateResponse: () => Promise<void>;
}
const useAssistantStore = create<AssistantState>((set, get) => ({
  isOpen: false,
  messages: [
    {
      id: 'initial-message',
      role: 'ai',
      content: 'Hello! I\'m Cerebrum AI. How can I help you today? You can ask me to explain an image, generate a picture, give you productivity tips, and more.',
    },
  ],
  toggleAssistant: () => set(state => ({ isOpen: !state.isOpen })),
  sendMessage: async (prompt: string, image?: { mimeType: string, data: string }) => {
    const userMessage: ChatMessage = { 
        id: `user-${Date.now()}`, 
        role: 'user', 
        content: prompt,
        image,
    };
    set(state => ({ messages: [...state.messages, userMessage] }));
    const messagesWithNewPrompt = get().messages;
    const loadingMessageId = `ai-${Date.now()}`;
    set(state => ({ messages: [...state.messages, { id: loadingMessageId, role: 'ai', content: '', status: 'loading' }] }));
    try {
      const response = await processAssistantRequest(messagesWithNewPrompt);
      if (response.type === 'stream') {
        let fullResponse = '';
        for await (const chunk of response.data) {
          fullResponse += chunk.text;
          set(state => ({
            messages: state.messages.map(m => m.id === loadingMessageId ? { ...m, content: fullResponse } : m),
          }));
        }
        set(state => ({
          messages: state.messages.map(m => m.id === loadingMessageId ? { ...m, status: undefined } : m),
        }));
      } else if (response.type === 'image') {
        set(state => ({
          messages: state.messages.map(m => m.id === loadingMessageId ? { 
              ...m, 
              content: response.content,
              image: response.image,
              status: undefined 
          } : m),
        }));
      }
    } catch (error) {
      console.error("Assistant request failed:", error);
      set(state => ({
        messages: state.messages.map(m => m.id === loadingMessageId ? { ...m, content: 'Sorry, I encountered an error. Please try again.', status: 'error' } : m),
      }));
    }
  },
  regenerateResponse: async () => {
    const { messages } = get();
    const lastUserMessageIndex = messages.map(m => m.role).lastIndexOf('user');
    if (lastUserMessageIndex === -1) return;
    // The AI message to be regenerated is the one after the last user message.
    const lastAiMessage = messages[lastUserMessageIndex + 1];
    if (lastAiMessage?.image) {
        toast.error("Cannot regenerate an image response. Please try a new prompt.");
        return;
    }
    const messagesToResend = messages.slice(0, lastUserMessageIndex + 1);
    set({ messages: messagesToResend });
    const loadingMessageId = `ai-${Date.now()}`;
    set(state => ({ messages: [...state.messages, { id: loadingMessageId, role: 'ai', content: '', status: 'loading' }] }));
    try {
        const stream = await getAssistantStream(get().messages);
        let fullResponse = '';
        for await (const chunk of stream) {
            fullResponse += chunk.text;
            set(state => ({
                messages: state.messages.map(m => m.id === loadingMessageId ? { ...m, content: fullResponse } : m),
            }));
        }
        set(state => ({
            messages: state.messages.map(m => m.id === loadingMessageId ? { ...m, status: undefined } : m),
        }));
    } catch (error) {
        console.error("Gemini stream failed on regenerate:", error);
        set(state => ({
            messages: state.messages.map(m => m.id === loadingMessageId ? { ...m, content: 'Sorry, I encountered another error.', status: 'error' } : m),
        }));
    }
  },
}));
export default useAssistantStore;
