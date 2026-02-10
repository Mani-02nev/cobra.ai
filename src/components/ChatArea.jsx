import React, { useRef, useEffect, useState } from 'react';
import { Send, Menu, Sparkles, AlertCircle, Paperclip, ImageIcon, X, FileText } from 'lucide-react';
import { Message } from './Message';
import { CONFIG } from '../utils/api';
import ThreeScene from './ThreeScene';
import { motion, AnimatePresence } from 'framer-motion';

export function ChatArea({
    currentChatId,
    messages = [],
    isLoading,
    sendMessage,
    toggleSidebar,
    mode,
    setMode
}) {
    const [input, setInput] = useState('');
    const [attachments, setAttachments] = useState([]);
    const chatEndRef = useRef(null);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = () => {
        if (!input.trim() && attachments.length === 0) return;

        // Pass attachments to sendMessage
        sendMessage(input, attachments);

        setInput('');
        setAttachments([]);
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleTextareaInput = (e) => {
        setInput(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
    };

    const handleFileChange = (e, type) => {
        const files = Array.from(e.target.files);
        const newAttachments = files.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            name: file.name,
            type: type === 'image' ? 'image' : 'file',
            preview: type === 'image' ? URL.createObjectURL(file) : null
        }));
        setAttachments(prev => [...prev, ...newAttachments]);
        e.target.value = ''; // Reset input
    };

    const removeAttachment = (id) => {
        setAttachments(prev => prev.filter(a => a.id !== id));
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-bg-primary relative overflow-hidden">
            {/* 3D Background Scene */}
            <ThreeScene isThinking={isLoading} />

            {/* Header */}
            <header className="flex items-center justify-between p-4 bg-bg-glass backdrop-blur-md border-b border-border-primary sticky top-0 z-20">
                <button
                    onClick={toggleSidebar}
                    className="md:hidden text-text-secondary p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
                >
                    <Menu size={24} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Sparkles size={16} className="text-white" />
                    </div>
                    <span className="font-bold text-lg text-gradient-suit hidden md:inline">CobrΔ AI</span>
                </div>
                <div className="flex items-center gap-2">
                    {/* Mode Selector */}
                    <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        className="bg-bg-tertiary text-text-secondary text-sm px-3 py-1.5 rounded-lg border border-border-secondary focus:border-accent outline-none appearance-none cursor-pointer hover:bg-bg-input transition-colors"
                    >
                        <option value="standard">Standard</option>
                        <option value="creative">Creative</option>
                        <option value="factual">Factual</option>
                    </select>
                </div>
            </header>

            {/* Messages or Hero */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth relative z-10">
                <AnimatePresence>
                    {messages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center justify-center h-full text-center p-8"
                        >
                            <div className="mb-6 relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                <div className="relative w-24 h-24 rounded-full bg-bg-secondary flex items-center justify-center border border-border-secondary">
                                    <Sparkles size={48} className="text-accent" />
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-gradient-suit tracking-tighter">
                                CobrΔ AI
                            </h1>
                            <p className="text-text-tertiary max-w-md mx-auto mb-8 text-lg">
                                Efficiency. Precision. Intelligence.
                            </p>

                            {!CONFIG.API_KEY && (
                                <div className="bg-orange-500/10 border border-orange-500/20 text-orange-500 p-4 rounded-lg flex items-start gap-3 max-w-md text-left text-sm">
                                    <AlertCircle className="flex-shrink-0 mt-0.5" size={16} />
                                    <div>
                                        <p className="font-semibold mb-1">API Key Missing</p>
                                        <p>Running in Mock Mode. Set <code className="bg-black/20 p-1 rounded">VITE_API_KEY</code> in <code className="bg-black/20 p-1 rounded">.env</code> to enable real AI responses.</p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        messages.map((msg) => (
                            <Message key={msg.id} message={msg} />
                        ))
                    )}
                </AnimatePresence>

                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-4 text-text-tertiary"
                    >
                        <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-0"></div>
                        <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-150"></div>
                        <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-300"></div>
                        <span className="text-xs ml-2">CobrΔ is thinking...</span>
                    </motion.div>
                )}

                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-bg-primary/50 backdrop-blur-md border-t border-border-primary relative z-20">
                <div className="max-w-3xl mx-auto md:w-full">
                    {/* Attachments Preview */}
                    <AnimatePresence>
                        {attachments.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: 10, height: 0 }}
                                className="flex flex-wrap gap-2 mb-2 p-2 bg-bg-secondary/50 rounded-lg overflow-hidden border border-border-primary"
                            >
                                {attachments.map(att => (
                                    <div key={att.id} className="relative group overflow-hidden rounded-md border border-border-secondary bg-bg-input flex items-center p-2">
                                        {att.type === 'image' ? (
                                            <img src={att.preview} alt="preview" className="w-10 h-10 object-cover rounded mr-2" />
                                        ) : (
                                            <FileText size={20} className="text-accent mr-2" />
                                        )}
                                        <span className="text-xs text-text-secondary truncate max-w-[100px]">{att.name}</span>
                                        <button
                                            onClick={() => removeAttachment(att.id)}
                                            className="absolute -top-1 -right-1 bg-danger-text text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="relative bg-bg-input rounded-xl border border-border-primary shadow-lg hover:border-border-secondary focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all duration-300">
                        <div className="flex items-end pr-12">
                            <div className="flex p-2 gap-1">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 text-text-tertiary hover:text-accent transition-colors rounded-lg hover:bg-bg-tertiary"
                                    title="Attach file"
                                >
                                    <Paperclip size={20} />
                                </button>
                                <button
                                    onClick={() => imageInputRef.current?.click()}
                                    className="p-2 text-text-tertiary hover:text-accent transition-colors rounded-lg hover:bg-bg-tertiary"
                                    title="Upload image"
                                >
                                    <ImageIcon size={20} />
                                </button>
                            </div>

                            <textarea
                                ref={textareaRef}
                                rows="1"
                                placeholder="Ask CobrΔ anything..."
                                className="w-full bg-transparent text-text-primary placeholder-text-tertiary p-4 pl-0 resize-none outline-none max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-border-secondary scrollbar-track-transparent"
                                value={input}
                                onChange={handleTextareaInput}
                                onKeyDown={handleKeyDown}
                            />
                        </div>

                        <button
                            onClick={handleSend}
                            disabled={(!input.trim() && attachments.length === 0) || isLoading}
                            className={`
                            absolute right-2 bottom-2 p-2 rounded-lg 
                            ${(input.trim() || attachments.length > 0) && !isLoading
                                    ? 'bg-accent text-white shadow-lg shadow-accent/20 hover:bg-accent-hover transform hover:scale-105'
                                    : 'bg-bg-tertiary text-text-tertiary cursor-not-allowed opacity-50'}
                            transition-all duration-200
                        `}
                        >
                            <Send size={18} />
                        </button>
                    </div>

                    {/* Hidden Native Inputs */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleFileChange(e, 'file')}
                        className="hidden"
                        multiple
                    />
                    <input
                        type="file"
                        ref={imageInputRef}
                        onChange={(e) => handleFileChange(e, 'image')}
                        accept="image/*"
                        className="hidden"
                        multiple
                    />

                    <p className="text-center text-xs text-text-tertiary mt-2">
                        Enter to send, Shift + Enter for new line. AI can make mistakes.
                    </p>
                </div>
            </div>
        </div>
    );
}
