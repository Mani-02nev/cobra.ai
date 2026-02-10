import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { useChat } from './hooks/useChat';
import { X, Moon, Sun, Monitor } from 'lucide-react';

function App() {
  const {
    chats,
    currentChatId,
    currentChat,
    isLoading,
    createNewChat,
    selectChat,
    deleteChat,
    sendMessage,
    sidebarOpen,
    toggleSidebar,
    theme,
    toggleTheme,
    mode,
    setMode,
    persona,
    setPersona,
    clearChats
  } = useChat();

  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="flex h-screen bg-bg-primary text-text-primary overflow-hidden font-sans transition-colors duration-300">
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        createNewChat={createNewChat}
        selectChat={selectChat}
        deleteChat={deleteChat}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        setOpenSettings={setShowSettings}
      />

      <main className="flex-1 min-w-0 relative flex flex-col h-full">
        {currentChatId ? (
          <ChatArea
            currentChatId={currentChatId}
            messages={currentChat?.messages || []}
            isLoading={isLoading}
            sendMessage={sendMessage}
            toggleSidebar={toggleSidebar}
            mode={mode}
            setMode={setMode}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <button onClick={toggleSidebar} className="absolute top-4 left-4 md:hidden p-2">
              <span className="sr-only">Open Menu</span>
              {/* Menu icon handled in ChatArea usually, but if no chat, we need one here too or just auto-create chat */}
            </button>
            <ChatArea
              currentChatId={null}
              messages={[]}
              isLoading={false}
              sendMessage={sendMessage}
              toggleSidebar={toggleSidebar}
              mode={mode}
              setMode={setMode}
            />
          </div>
        )}
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-bg-glass backdrop-blur-xl border border-border-primary rounded-xl shadow-2xl w-full max-w-md m-4 overflow-hidden animate-fade-in transform scale-100">
            <div className="flex items-center justify-between p-4 border-b border-border-primary">
              <h2 className="text-lg font-bold text-gradient-suit">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-bg-tertiary rounded-full transition-colors text-text-secondary">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Moon size={20} className="text-accent" /> : <Sun size={20} className="text-orange-400" />}
                  <span className="font-medium text-text-primary">Dark Mode</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} className="sr-only peer" />
                  <div className="w-11 h-6 bg-border-secondary peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                </label>
              </div>

              {/* Persona Selector */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">System Persona</label>
                <select
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  className="w-full bg-bg-input border border-border-primary rounded-lg p-2.5 text-text-primary focus:ring-accent focus:border-accent"
                >
                  <option value="assistant">Helpful Assistant</option>
                  <option value="developer">Developer Expert</option>
                  <option value="writer">Creative Writer</option>
                  <option value="sql">SQL Helper</option>
                  <option value="sarcastic">Sarcastic Friend</option>
                </select>
              </div>

              {/* Data Management */}
              <div className="pt-4 border-t border-border-primary">
                <h3 className="text-sm font-semibold text-text-tertiary uppercase tracking-wider mb-4">Data</h3>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all chats? This cannot be undone.')) {
                      clearChats();
                      setShowSettings(false);
                    }
                  }}
                  className="w-full py-2.5 px-4 bg-danger-hover text-danger-text rounded-lg border border-danger-text/20 hover:bg-red-500 hover:text-white transition-all duration-200 font-medium text-sm"
                >
                  Clear All Chats
                </button>
              </div>

              <div className="pt-2 text-center text-xs text-text-tertiary">
                CobrΔ AI v2.0 (React)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
