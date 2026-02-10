import { useState, useEffect, useCallback, useRef } from 'react';
import { getAIResponse } from '../utils/api';

const STORAGE_KEY = 'cobraAI_state';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

export function useChat() {
    const [chats, setChats] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [theme, setTheme] = useState('dark');
    const [mode, setMode] = useState('standard');
    const [persona, setPersona] = useState('assistant');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            setChats(parsed.chats || []);
            setCurrentChatId(parsed.currentChatId || null);
            setTheme(parsed.theme || 'dark');
            setMode(parsed.mode || 'standard');
            setPersona(parsed.persona || 'assistant');
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        const state = { chats, currentChatId, theme, mode, persona };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [chats, currentChatId, theme, mode, persona]);

    // Apply theme
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.remove('light-theme');
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.add('light-theme');
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const createNewChat = useCallback(() => {
        const newChat = {
            id: generateId(),
            title: 'New Chat',
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setChats(prev => [newChat, ...prev]);
        setCurrentChatId(newChat.id);
        setSidebarOpen(false);
        return newChat;
    }, []);

    const selectChat = useCallback((id) => {
        setCurrentChatId(id);
        setSidebarOpen(false);
    }, []);

    const deleteChat = useCallback((id, e) => {
        e?.stopPropagation();
        setChats(prev => {
            const newChats = prev.filter(c => c.id !== id);
            if (currentChatId === id) {
                setCurrentChatId(newChats.length > 0 ? newChats[0].id : null);
            }
            return newChats;
        });
    }, [currentChatId]);

    const clearChats = useCallback(() => {
        setChats([]);
        setCurrentChatId(null);
    }, []);

    const sendMessage = useCallback(async (content, attachments = []) => {
        if (!content.trim() && attachments.length === 0) return;

        let activeChatId = currentChatId;
        let activeChatMessages = [];

        if (!activeChatId) {
            const newChat = createNewChat();
            activeChatId = newChat.id;
            activeChatMessages = [];
        } else {
            const chat = chats.find(c => c.id === activeChatId);
            if (chat) {
                activeChatMessages = chat.messages;
            }
        }

        const userMessage = {
            id: generateId(),
            role: 'user',
            content,
            attachments, // Store attachments in message object
            timestamp: new Date().toISOString()
        };

        // Optimistic update
        setChats(prev => prev.map(c => {
            if (c.id === activeChatId) {
                return {
                    ...c,
                    messages: [...c.messages, userMessage],
                    title: c.messages.length === 0 ? (content.slice(0, 30) || 'New Chat') : c.title,
                    updatedAt: new Date().toISOString()
                };
            }
            return c;
        }));

        setIsLoading(true);

        try {
            // Construct history for API call
            const history = [...activeChatMessages, userMessage];

            // Note: Currently, attachments are ignored by the API call as we are using a text-only endpoint.
            // In a real-world scenario, you would send base64 data for images if using a vision-capable model.
            const aiResponseContent = await getAIResponse(content, history, mode, persona);

            const aiMessage = {
                id: generateId(),
                role: 'assistant',
                content: aiResponseContent,
                timestamp: new Date().toISOString()
            };

            setChats(prev => prev.map(c => {
                if (c.id === activeChatId) {
                    return {
                        ...c,
                        messages: [...c.messages, aiMessage],
                        updatedAt: new Date().toISOString()
                    };
                }
                return c;
            }));
        } catch (error) {
            console.error(error);
            const errorMessage = {
                id: generateId(),
                role: 'assistant',
                content: `Error: ${error.message || 'Failed to get response. Please check your API key or connection.'}`,
                timestamp: new Date().toISOString()
            };
            setChats(prev => prev.map(c => {
                if (c.id === activeChatId) {
                    return {
                        ...c,
                        messages: [...c.messages, errorMessage]
                    };
                }
                return c;
            }));
        } finally {
            setIsLoading(false);
        }
    }, [currentChatId, chats, mode, persona, createNewChat]);

    return {
        chats,
        currentChatId,
        currentChat: chats.find(c => c.id === currentChatId),
        sidebarOpen,
        theme,
        mode,
        persona,
        isLoading,
        createNewChat,
        selectChat,
        deleteChat,
        sendMessage,
        setSidebarOpen,
        toggleSidebar: () => setSidebarOpen(prev => !prev),
        toggleTheme: () => setTheme(prev => prev === 'dark' ? 'light' : 'dark'),
        setMode,
        setPersona,
        clearChats
    };
}
