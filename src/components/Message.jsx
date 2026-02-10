import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';
import { Bot, User, Copy, Check, FileText, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export function Message({ message }) {
    const isUser = message.role === 'user';
    const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, x: isUser ? 10 : -10 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            className={`group flex gap-4 p-4 ${isUser ? 'flex-row-reverse' : ''} hover:bg-bg-tertiary/20 rounded-xl transition-colors relative z-10`}
        >
            <div className={`
                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center 
                ${isUser ? 'bg-accent/20 text-accent' : 'bg-emerald-500/20 text-emerald-400'}
                border border-current shadow-lg
            `}>
                {isUser ? <User size={16} /> : <Bot size={16} />}
            </div>

            <div className={`flex flex-col gap-1 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-text-primary capitalize">
                        {isUser ? 'You' : 'CobrΔ AI'}
                    </span>
                    <span className="text-xs text-text-tertiary">{time}</span>
                </div>

                {/* Attachments Display */}
                {message.attachments && message.attachments.length > 0 && (
                    <div className={`flex flex-wrap gap-2 mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                        {message.attachments.map((att, idx) => (
                            <div key={idx} className="relative group/att rounded-lg overflow-hidden border border-border-primary bg-bg-secondary shadow-md">
                                {att.type === 'image' ? (
                                    <div className="relative">
                                        <img
                                            src={att.preview || att.url}
                                            alt={att.name}
                                            className="max-w-[200px] max-h-[200px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => window.open(att.preview || att.url, '_blank')}
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/att:opacity-100 transition-opacity flex items-center justify-center">
                                            <Download size={20} className="text-white" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center p-3 gap-3">
                                        <div className="w-10 h-10 bg-bg-tertiary rounded flex items-center justify-center">
                                            <FileText size={20} className="text-accent" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-text-primary font-medium truncate max-w-[150px]">{att.name}</span>
                                            <span className="text-[10px] text-text-tertiary">File</span>
                                        </div>
                                        <a
                                            href={att.preview || att.url}
                                            download={att.name}
                                            className="p-1.5 hover:bg-bg-tertiary rounded-lg text-text-tertiary hover:text-text-primary transition-colors"
                                        >
                                            <Download size={16} />
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className={`
                    prose prose-invert max-w-none text-sm leading-relaxed 
                    p-3 rounded-2xl shadow-sm
                    markdown-content
                    ${isUser
                        ? 'bg-accent/10 border border-accent/20 text-text-primary rounded-tr-none'
                        : 'bg-bg-secondary border border-border-primary text-text-secondary rounded-tl-none'}
                `}>
                    <ReactMarkdown
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                            code({ node, inline, className, children, ...props }) {
                                if (inline) {
                                    return (
                                        <code className="bg-bg-tertiary text-accent px-1 py-0.5 rounded border border-border-primary text-xs" {...props}>
                                            {children}
                                        </code>
                                    );
                                }
                                return (
                                    <div className="relative group/code my-4">
                                        <div className="absolute right-2 top-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
                                                className="p-1 bg-bg-tertiary rounded hover:bg-bg-primary text-text-secondary"
                                                title="Copy code"
                                            >
                                                <Copy size={12} />
                                            </button>
                                        </div>
                                        <pre className="!bg-bg-primary/50 !p-4 !rounded-lg !border !border-border-primary overflow-x-auto scollbar-thin">
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        </pre>
                                    </div>
                                );
                            }
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                </div>

                {!isUser && (
                    <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                        <button
                            onClick={handleCopy}
                            className="p-1 text-text-tertiary hover:text-text-primary transition-colors flex items-center gap-1 text-xs"
                        >
                            {copied ? <Check size={12} className="text-accent" /> : <Copy size={12} />}
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
