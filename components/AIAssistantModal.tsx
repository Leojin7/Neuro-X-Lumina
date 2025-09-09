
import React, { useState, useRef, useEffect, useCallback, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, User, BrainCircuit, X, Send, Clipboard, RefreshCw, Loader2, Check, Paperclip, Mic, Video, Download } from 'lucide-react';
import useAssistantStore from '../stores/useAssistantStore';
import type { ChatMessage } from '../types';
import toast from 'react-hot-toast';
// Floating Glass FAB
const FAB = ({ onClick }: { onClick: () => void }) => (
  <motion.button
    onClick={onClick}
    className={`fixed bottom-4 right-4 bg-gradient-to-br from-blue-600 via-violet-600 to-fuchsia-500 shadow-2xl text-white rounded-full
      transition-all duration-300 border-none flex items-center justify-center hover:shadow-[0_0_80px_16px_rgba(88,80,180,0.8)]
      ring-4 ring-white/40 hover:ring-white/60`}
    whileHover={{ scale: 1.1, rotate: 5 }}
    whileTap={{ scale: 0.95 }}
    aria-label="Open NeuroLearn AI Assistant"
    style={{
      boxShadow: "0 12px 50px 0 rgb(88 80 180 / 50%), 0 8px 25px 0 rgb(43 48 75 / 25%)",
      width: '80px',
      height: '80px',
      zIndex: 999999,
      position: 'fixed'
    }}
  >
    <motion.div
      animate={{
        scale: [1, 1.3, 0.9, 1],
        rotate: [0, 10, -5, 0],
        filter: [
          "drop-shadow(0 0 8px #a385fa)",
          "drop-shadow(0 0 20px #a385fa)",
          "drop-shadow(0 0 12px #b6baff)",
          "drop-shadow(0 0 6px #a385fa)"
        ]
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className="flex items-center justify-center"
    >
      <Sparkles size={36} className="text-white drop-shadow-lg" />
    </motion.div>
    { }
    <motion.div
      className="absolute inset-0 rounded-full border-2 border-white/30"
      animate={{
        scale: [1, 1.4, 1],
        opacity: [0.8, 0, 0.8]
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
    />
    { }
    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-3 h-3 bg-white rounded-full"
      />
    </div>
  </motion.button>
);

// Core Assistant Modal
const AIAssistantModal = () => {
  const { isOpen, toggleAssistant } = useAssistantStore();

  return (
    <>
      <FAB onClick={toggleAssistant} />
      <AnimatePresence>
        {isOpen && <ChatWindow />}
      </AnimatePresence>
    </>
  );
};

// Glass Chat Window
const ChatWindow = () => {
  const { toggleAssistant, messages, sendMessage, regenerateResponse } = useAssistantStore();
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ file: File; base64: string } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const isLoading = messages[messages.length - 1]?.status === 'loading';
  useEffect(() => {
    if (chatContainerRef.current)
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [messages]);
  // Speech Recognition setup
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setInput(input + finalTranscript + interimTranscript);
      };
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast.error('Voice recognition error. Please check microphone permissions.');
        setIsListening(false);
      };
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [input]);
  const handleSend = useCallback(() => {
    if ((input.trim() || selectedImage) && !isLoading) {
      sendMessage(input.trim(), selectedImage ? { mimeType: selectedImage.file.type, data: selectedImage.base64 } : undefined);
      setInput('');
      setSelectedImage(null);
    }
  }, [input, isLoading, sendMessage, selectedImage]);
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage({ file, base64: (reader.result as string).split(',')[1] });
      };
      reader.readAsDataURL(file);
    }
  };
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-[6px] z-[110] flex items-center justify-center p-4"
      onClick={toggleAssistant}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 40 }}
        transition={{ duration: 0.33, ease: "easeOut" }}
        className="w-full max-w-2xl h-[85vh] bg-white bg-opacity-[0.13] shadow-2xl shadow-black/15 dark:bg-gradient-to-br dark:from-[#171928]/70 dark:via-[#252350]/90 dark:to-[#19162c]/85 border border-white/15 rounded-[2.5rem] flex flex-col overflow-hidden glass-blur relative"
        onClick={(e: MouseEvent) => e.stopPropagation()}
        style={{ backdropFilter: "blur(32px) saturate(1.2)" }}
      >
        <header className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0 bg-gradient-to-r from-violet-900/10 to-fuchsia-800/10">
          <div className="flex items-center space-x-4">
            <motion.div animate={{ rotate: [0, 13, -8, 0], scale: [1, 1.12, 1.06, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="bg-gradient-to-br from-blue-600/80 to-violet-500/70 shadow-lg p-2 rounded-xl flex items-center">
              <BrainCircuit className="text-white" size={29} />
            </motion.div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-fuchsia-200 tracking-widest">
              NeuroLearn Assistant
            </h2>
          </div>
          <motion.button whileHover={{ rotate: 90, backgroundColor: "#a8a6f5" }} className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full" onClick={toggleAssistant} aria-label="Close the chatbot">
            <X size={26} />
          </motion.button>
        </header>
        <div ref={chatContainerRef} className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {messages.length === 0 && !isLoading && (
            <motion.div initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, type: "spring", stiffness: 120 }} className="flex flex-col items-center justify-center h-full text-muted-foreground text-center">
              <Sparkles size={60} className="text-blue-400/60 mb-5 animate-pulse" />
              <h2 className="text-2xl font-semibold text-white mb-3 tracking-tight">Start chatting with NeuroLearn AI</h2>
              <p className="text-base text-gray-200/80 font-medium">Ask for study plans, productivity tips, explanations, or emotional health guidance.</p>
            </motion.div>
          )}
          {messages.map(msg => (
            <div key={msg.id}>
              <ChatMessageItem
                message={msg}
                onRegenerate={regenerateResponse}
                copiedMsgId={copiedMsgId}
                setCopiedMsgId={setCopiedMsgId}
              />
            </div>
          ))}
        </div>
        <footer className="p-5 border-t border-white/10 flex-shrink-0 bg-[#211f38]/40">
          <div className="bg-gradient-to-r from-white/10 via-white/10 to-violet-900/10 rounded-2xl border border-white/15 shadow focus-within:ring-2 ring-primary transition p-2">
            <AnimatePresence>
              {selectedImage && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="relative w-24 h-24 p-2">
                  <img src={`data:${selectedImage.file.type};base64,${selectedImage.base64}`} alt="upload preview" className="w-full h-full object-cover rounded-lg" />
                  <button onClick={() => setSelectedImage(null)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X size={14} /></button>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex items-end space-x-2">
              <input type="file" ref={fileInputRef} onChange={handleImageSelect} className="hidden" accept="image/*" />
              <button onClick={() => toast('Video summarization coming soon!')} className="p-2 text-white/70 hover:text-white transition-colors" aria-label="Attach video"><Video size={21} /></button>
              <button onClick={() => fileInputRef.current?.click()} className="p-2 text-white/70 hover:text-white transition-colors" aria-label="Attach image"><Paperclip size={21} /></button>
              {recognitionRef.current && (
                <button onClick={toggleListening} className={`p-2 transition-colors ${isListening ? 'text-red-400' : 'text-white/70 hover:text-white'}`} aria-label="Use microphone">
                  <Mic size={21} />
                </button>
              )}
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Share your thoughts or questions..."
                rows={1}
                spellCheck={false}
                className="flex-1 bg-transparent text-white placeholder:text-white/60 py-2 px-0 focus:outline-none resize-none custom-scrollbar max-h-28"
                disabled={isLoading}
                aria-label="Chat input"
              />
              <motion.button
                onClick={handleSend}
                disabled={(!input.trim() && !selectedImage) || isLoading}
                className={`bg-gradient-to-tr from-blue-600 via-violet-600 to-fuchsia-500 rounded-xl p-3 transition-all duration-200 flex items-center justify-center shadow-xl hover:scale-110 
                  disabled:opacity-50 disabled:cursor-not-allowed`}
                whileHover={{ scale: 1.088 }}
                whileTap={{ scale: 0.96 }}
                aria-label="Send message"
                tabIndex={0}
              >
                {isLoading ? <Loader2 size={21} className="animate-spin" /> : <Send size={21} />}
              </motion.button>
            </div>
          </div>
        </footer>
      </motion.div>
    </motion.div>
  );
};
// Chat message 
const ChatMessageItem = ({
  message,
  onRegenerate,
  copiedMsgId,
  setCopiedMsgId
}: {
  message: ChatMessage;
  onRegenerate: () => void;
  copiedMsgId: string | null;
  setCopiedMsgId: (msgId: string | null) => void;
}) => {
  const isAI = message.role === "ai";
  const [justCopied, setJustCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopiedMsgId(message.id);
    setJustCopied(true);
    setTimeout(() => {
      setJustCopied(false);
      setCopiedMsgId(null);
    }, 1300);
  };
  const handleDownloadImage = () => {
    if (!message.image) return;
    const link = document.createElement('a');
    link.href = `data:${message.image.mimeType};base64,${message.image.data}`;
    link.download = `lumina-ai-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Image download started!');
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 21 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.19 }}
      className={`flex items-start gap-4 ${isAI ? "" : "justify-end"}`}
    >
      {isAI && (
        <motion.div
          animate={{ scale: [0.96, 1.11, 1.03, 1], filter: ["blur(0.5px)", "blur(0px)", "blur(0.2px)", "blur(0px)"] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600/40 via-violet-600/30 to-fuchsia-500/40 shadow"
        >
          <BrainCircuit size={23} className="text-blue-200" />
        </motion.div>
      )}
      <div className={`
        max-w-[82%] min-w-[80px] p-4 text-base rounded-2xl relative shadow group leading-relaxed
        ${isAI
          ? `bg-gradient-to-br from-blue-800/20 via-violet-900/14 to-white/10 text-blue-100 rounded-bl-md`
          : `bg-gradient-to-r from-fuchsia-600 to-blue-600 text-white rounded-br-md`
        }
      `}>
        {message.status === "loading" ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 size={18} className="animate-spin" />
            <motion.span animate={{ opacity: [0.6, 1, 0.5, 1], scale: [0.95, 1.08, 0.93, 1] }} transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }} className="tracking-wide">
              Thinking...
            </motion.span>
          </div>
        ) : message.status === "error" ? (
          <div className="space-y-2">
            <p className="text-sm text-destructive">{message.content}</p>
            <button onClick={onRegenerate} className="flex items-center text-xs text-destructive hover:text-destructive/80 transition gap-2 mt-1">
              <RefreshCw size={13} />
              Regenerate
            </button>
          </div>
        ) : (
          <>
            {message.image && (
              <div className="relative group/image rounded-lg overflow-hidden mb-2">
                <img src={`data:${message.image.mimeType};base64,${message.image.data}`} alt={isAI ? "Generated image" : "User upload"} className="max-h-60 w-full object-cover" />
                {isAI && (
                  <button
                    onClick={handleDownloadImage}
                    className="absolute bottom-2 right-2 bg-black/40 backdrop-blur-sm p-2 rounded-full text-white hover:bg-black/60 transition-all opacity-0 group-hover/image:opacity-100"
                    aria-label="Download generated image"
                    title="Download Image"
                  >
                    <Download size={18} />
                  </button>
                )}
              </div>
            )}
            {message.content && (
              <span className="whitespace-pre-wrap block text-base tracking-normal">
                {message.content}
              </span>
            )}
            {isAI && message.content && (
              <button
                onClick={handleCopy}
                className={`absolute top-2 right-3 bg-black/10 p-1 rounded-md text-blue-200 hover:text-blue-400 transition-opacity opacity-0 group-hover:opacity-100 ${justCopied || copiedMsgId === message.id ? "ring-2 ring-blue-400" : ""}`}
                aria-label="Copy message"
              >
                {justCopied || copiedMsgId === message.id ? <Check size={15} className="text-blue-300" /> : <Clipboard size={16} />}
              </button>
            )}
          </>
        )}
      </div>
      {!isAI && (
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-tr from-white/20 via-white/10 to-violet-600/10 shadow">
          <User size={22} className="text-white/60" />
        </div>
      )}
    </motion.div>
  );
};
export default AIAssistantModal;