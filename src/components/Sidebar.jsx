import React from 'react';
import { Plus, MessageSquare, Trash2, Settings, Search, X } from 'lucide-react';

export function Sidebar({
    chats,
    currentChatId,
    createNewChat,
    selectChat,
    deleteChat,
    sidebarOpen,
    toggleSidebar,
    setOpenSettings
}) {
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredChats = chats.filter(chat =>
        chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.messages.some(m => m.content.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <>
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            <aside
                className={`sidebar flex flex-col transition-transform duration-300 ease-in-out border-r border-border-primary
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          w-72 md:w-72 bg-bg-glass backdrop-blur-md h-full fixed md:relative z-40
        `}
            >
                <div className="p-4 flex items-center justify-between md:hidden">
                    <h2 className="text-xl font-bold text-gradient-suit">CobrΔ</h2>
                    <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-bg-tertiary text-text-secondary">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-2 border-b border-border-primary">
                    <button
                        onClick={createNewChat}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-all border border-accent/20 hover:border-accent/40"
                    >
                        <Plus size={20} />
                        <span className="font-medium">New Chat</span>
                    </button>
                </div>

                <div className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-bg-input border border-border-primary rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    <h3 className="px-4 py-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                        Recent
                    </h3>
                    {filteredChats.length === 0 ? (
                        <div className="text-center p-4 text-text-tertiary text-sm">
                            No chats found
                        </div>
                    ) : (
                        filteredChats.map(chat => (
                            <div
                                key={chat.id}
                                onClick={() => selectChat(chat.id)}
                                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors
                  ${chat.id === currentChatId
                                        ? 'bg-accent/10 border border-accent/20 text-accent'
                                        : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary border border-transparent'}
                `}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <MessageSquare size={18} className="flex-shrink-0" />
                                    <span className="truncate text-sm font-medium">
                                        {chat.title || 'New Chat'}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-danger-hover hover:text-danger-text rounded transition-all"
                                    title="Delete Chat"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-border-primary">
                    <button
                        onClick={() => setOpenSettings(true)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors"
                    >
                        <Settings size={20} />
                        <span>Settings</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
