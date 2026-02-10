// ============================================
// COBRA AI - PREMIUM AI CHATBOT DASHBOARD
// Vanilla JavaScript - No Frameworks
// ============================================

// ============================================
// ENVIRONMENT VARIABLES
// ============================================
// IMPORTANT: Set these in Vercel Dashboard
// Go to: Project Settings → Environment Variables
// Add the following variables:
// - API_URL: Your AI API endpoint (e.g., https://api.openai.com/v1/chat/completions)
// - API_KEY: Your API authentication key
// 
// Access them in Vercel using process.env or window.ENV
// For local development, you can set them here temporarily:

const CONFIG = {
  API_URL: window.ENV?.API_URL || process.env.API_URL || '',
  API_KEY: window.ENV?.API_KEY || process.env.API_KEY || '',
  // Mock mode for demo purposes (set to false when API is configured)
  MOCK_MODE: true
};

// ============================================
// STATE MANAGEMENT
// ============================================
const state = {
  currentChatId: null,
  chats: [],
  currentMode: 'standard',
  currentPersona: 'assistant',
  theme: 'dark',
  sidebarOpen: false
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

function initializeApp() {
  loadStateFromStorage();
  setupEventListeners();
  renderChatList();
  updateTheme();
  
  // Show hero section if no active chat
  if (!state.currentChatId) {
    showHeroSection();
  } else {
    loadChat(state.currentChatId);
  }
  
  // Add welcome message for demo
  if (state.chats.length === 0) {
    createDemoChats();
  }
}

// ============================================
// LOCAL STORAGE
// ============================================
function loadStateFromStorage() {
  const savedState = localStorage.getItem('cobraAI_state');
  if (savedState) {
    const parsed = JSON.parse(savedState);
    state.chats = parsed.chats || [];
    state.currentChatId = parsed.currentChatId || null;
    state.theme = parsed.theme || 'dark';
    state.currentMode = parsed.currentMode || 'standard';
    state.currentPersona = parsed.currentPersona || 'assistant';
  }
}

function saveStateToStorage() {
  localStorage.setItem('cobraAI_state', JSON.stringify({
    chats: state.chats,
    currentChatId: state.currentChatId,
    theme: state.theme,
    currentMode: state.currentMode,
    currentPersona: state.currentPersona
  }));
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
  // Theme toggle
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  
  // New chat button
  document.getElementById('newChatBtn').addEventListener('click', createNewChat);
  
  // Send message
  document.getElementById('sendBtn').addEventListener('click', sendMessage);
  
  // Message input - Enter to send
  const messageInput = document.getElementById('messageInput');
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  
  // Auto-resize textarea
  messageInput.addEventListener('input', autoResizeTextarea);
  
  // Mode selector
  document.querySelectorAll('.mode-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      document.querySelectorAll('.mode-pill').forEach(p => p.classList.remove('active'));
      e.currentTarget.classList.add('active');
      state.currentMode = e.currentTarget.dataset.mode;
      saveStateToStorage();
    });
  });
  
  // Persona selector
  document.getElementById('personaDropdown').addEventListener('change', (e) => {
    state.currentPersona = e.target.value;
    saveStateToStorage();
  });
  
  // Category buttons
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      filterChatsByCategory(e.currentTarget.dataset.category);
    });
  });
  
  // Search
  document.getElementById('searchInput').addEventListener('input', (e) => {
    searchChats(e.target.value);
  });
  
  // Mobile menu toggle
  document.getElementById('mobileMenuToggle').addEventListener('click', toggleSidebar);
  document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);
  
  // Download chat
  document.getElementById('downloadBtn').addEventListener('click', downloadCurrentChat);
  
  // Close sidebar on mobile when clicking a chat
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      closeSidebar();
    }
  });
}

// ============================================
// THEME MANAGEMENT
// ============================================
function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  updateTheme();
  saveStateToStorage();
}

function updateTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
}

// ============================================
// SIDEBAR MANAGEMENT
// ============================================
function toggleSidebar() {
  state.sidebarOpen = !state.sidebarOpen;
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  
  if (state.sidebarOpen) {
    sidebar.classList.add('active');
    overlay.classList.add('active');
  } else {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
  }
}

function closeSidebar() {
  state.sidebarOpen = false;
  document.getElementById('sidebar').classList.remove('active');
  document.getElementById('sidebarOverlay').classList.remove('active');
}

// ============================================
// CHAT MANAGEMENT
// ============================================
function createNewChat() {
  const chatId = generateId();
  const newChat = {
    id: chatId,
    title: 'New Chat',
    category: 'personal',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  state.chats.unshift(newChat);
  state.currentChatId = chatId;
  saveStateToStorage();
  renderChatList();
  showHeroSection();
  
  // Close sidebar on mobile
  if (window.innerWidth <= 768) {
    closeSidebar();
  }
}

function loadChat(chatId) {
  state.currentChatId = chatId;
  const chat = state.chats.find(c => c.id === chatId);
  
  if (!chat) return;
  
  hideHeroSection();
  renderMessages(chat.messages);
  highlightActiveChat(chatId);
  saveStateToStorage();
  
  // Close sidebar on mobile
  if (window.innerWidth <= 768) {
    closeSidebar();
  }
}

function deleteChat(chatId) {
  state.chats = state.chats.filter(c => c.id !== chatId);
  
  if (state.currentChatId === chatId) {
    state.currentChatId = state.chats.length > 0 ? state.chats[0].id : null;
    if (state.currentChatId) {
      loadChat(state.currentChatId);
    } else {
      showHeroSection();
    }
  }
  
  saveStateToStorage();
  renderChatList();
}

// ============================================
// MESSAGE MANAGEMENT
// ============================================
async function sendMessage() {
  const input = document.getElementById('messageInput');
  const message = input.value.trim();
  
  if (!message) return;
  
  // Create chat if none exists
  if (!state.currentChatId) {
    createNewChat();
  }
  
  const chat = state.chats.find(c => c.id === state.currentChatId);
  if (!chat) return;
  
  // Add user message
  const userMessage = {
    id: generateId(),
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  };
  
  chat.messages.push(userMessage);
  
  // Update chat title if first message
  if (chat.messages.length === 1) {
    chat.title = message.substring(0, 50) + (message.length > 50 ? '...' : '');
  }
  
  chat.updatedAt = new Date().toISOString();
  
  // Clear input
  input.value = '';
  autoResizeTextarea({ target: input });
  
  // Hide hero and render messages
  hideHeroSection();
  renderMessages(chat.messages);
  saveStateToStorage();
  renderChatList();
  
  // Show typing indicator
  showTypingIndicator();
  
  // Get AI response
  try {
    const aiResponse = await getAIResponse(message, chat.messages);
    
    // Remove typing indicator
    hideTypingIndicator();
    
    // Add AI message
    const aiMessage = {
      id: generateId(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    };
    
    chat.messages.push(aiMessage);
    chat.updatedAt = new Date().toISOString();
    
    renderMessages(chat.messages);
    saveStateToStorage();
    renderChatList();
  } catch (error) {
    hideTypingIndicator();
    console.error('Error getting AI response:', error);
    showErrorMessage('Failed to get response. Please try again.');
  }
}

// ============================================
// API INTEGRATION
// ============================================
async function getAIResponse(message, conversationHistory) {
  // If in mock mode or no API configured, return mock response
  if (CONFIG.MOCK_MODE || !CONFIG.API_URL || !CONFIG.API_KEY) {
    return getMockResponse(message);
  }
  
  try {
    // Example API call structure
    // Adjust based on your specific API requirements
    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Adjust based on your API
        messages: [
          {
            role: 'system',
            content: getSystemPrompt()
          },
          ...conversationHistory.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ],
        temperature: state.currentMode === 'creative' ? 0.9 : state.currentMode === 'factual' ? 0.3 : 0.7,
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

function getSystemPrompt() {
  const personaPrompts = {
    assistant: 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.',
    developer: 'You are an expert software developer. Provide technical, detailed responses with code examples when relevant.',
    writer: 'You are a creative writer. Provide imaginative, engaging, and well-crafted responses.',
    analyst: 'You are a data analyst. Provide analytical, data-driven responses with insights and recommendations.',
    teacher: 'You are a patient teacher. Provide educational, easy-to-understand explanations.'
  };
  
  return personaPrompts[state.currentPersona] || personaPrompts.assistant;
}

function getMockResponse(message) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const responses = [
        `I understand you're asking about "${message}". As an AI assistant, I'm here to help you with that. This is a demo response since the API is not configured yet.`,
        `That's an interesting question about "${message}". In a production environment, I would provide a detailed response based on the AI model's capabilities.`,
        `Thank you for your message. To get real AI responses, please configure your API credentials in the Vercel environment variables (API_URL and API_KEY).`,
        `I've processed your query about "${message}". This is a simulated response. Configure your AI API to get intelligent, context-aware answers.`
      ];
      
      resolve(responses[Math.floor(Math.random() * responses.length)]);
    }, 1500);
  });
}

// ============================================
// UI RENDERING
// ============================================
function renderChatList() {
  const chatList = document.getElementById('chatList');
  
  if (state.chats.length === 0) {
    chatList.innerHTML = `
      <div class="empty-state" style="padding: 40px 20px;">
        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <p class="empty-state-text">No chats yet.<br>Start a new conversation!</p>
      </div>
    `;
    return;
  }
  
  chatList.innerHTML = state.chats.map(chat => {
    const lastMessage = chat.messages[chat.messages.length - 1];
    const preview = lastMessage ? lastMessage.content.substring(0, 60) : 'No messages yet';
    const timeAgo = getTimeAgo(new Date(chat.updatedAt));
    
    return `
      <div class="chat-item ${chat.id === state.currentChatId ? 'active' : ''}" 
           onclick="loadChat('${chat.id}')"
           data-chat-id="${chat.id}">
        <div class="chat-item-title">${escapeHtml(chat.title)}</div>
        <div class="chat-item-preview">${escapeHtml(preview)}</div>
        <div class="chat-item-time">${timeAgo}</div>
      </div>
    `;
  }).join('');
}

function renderMessages(messages) {
  const chatArea = document.getElementById('chatArea');
  
  if (messages.length === 0) {
    chatArea.innerHTML = `
      <div class="empty-state">
        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <div class="empty-state-title">Start the conversation</div>
        <div class="empty-state-text">Type a message below to begin chatting with Cobra AI</div>
      </div>
    `;
    return;
  }
  
  chatArea.innerHTML = messages.map(msg => {
    const time = new Date(msg.timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const avatar = msg.role === 'user' ? 'U' : 'AI';
    
    return `
      <div class="message ${msg.role}">
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
          <div class="message-text">${escapeHtml(msg.content)}</div>
          <span class="message-time">${time}</span>
        </div>
      </div>
    `;
  }).join('');
  
  scrollToBottom();
}

function showTypingIndicator() {
  const chatArea = document.getElementById('chatArea');
  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  indicator.id = 'typingIndicator';
  indicator.innerHTML = `
    <div class="message-avatar">AI</div>
    <div class="typing-dots">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  chatArea.appendChild(indicator);
  scrollToBottom();
}

function hideTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) {
    indicator.remove();
  }
}

function showHeroSection() {
  document.getElementById('heroSection').style.display = 'block';
  document.getElementById('chatArea').innerHTML = '';
}

function hideHeroSection() {
  document.getElementById('heroSection').style.display = 'none';
}

function highlightActiveChat(chatId) {
  document.querySelectorAll('.chat-item').forEach(item => {
    item.classList.remove('active');
  });
  
  const activeItem = document.querySelector(`[data-chat-id="${chatId}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
  }
}

function showErrorMessage(message) {
  const chatArea = document.getElementById('chatArea');
  const errorDiv = document.createElement('div');
  errorDiv.className = 'message';
  errorDiv.innerHTML = `
    <div class="message-avatar" style="background: linear-gradient(135deg, #ef4444, #dc2626);">!</div>
    <div class="message-content" style="border-color: rgba(239, 68, 68, 0.3);">
      <div class="message-text" style="color: #ef4444;">${escapeHtml(message)}</div>
    </div>
  `;
  chatArea.appendChild(errorDiv);
  scrollToBottom();
}

// ============================================
// CHAT FILTERING & SEARCH
// ============================================
function filterChatsByCategory(category) {
  const chatItems = document.querySelectorAll('.chat-item');
  
  chatItems.forEach(item => {
    const chatId = item.dataset.chatId;
    const chat = state.chats.find(c => c.id === chatId);
    
    if (category === 'all' || chat.category === category) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

function searchChats(query) {
  const chatItems = document.querySelectorAll('.chat-item');
  const lowerQuery = query.toLowerCase();
  
  chatItems.forEach(item => {
    const chatId = item.dataset.chatId;
    const chat = state.chats.find(c => c.id === chatId);
    
    const titleMatch = chat.title.toLowerCase().includes(lowerQuery);
    const messageMatch = chat.messages.some(msg => 
      msg.content.toLowerCase().includes(lowerQuery)
    );
    
    if (titleMatch || messageMatch || query === '') {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

// ============================================
// DOWNLOAD CHAT
// ============================================
function downloadCurrentChat() {
  if (!state.currentChatId) {
    alert('No active chat to download');
    return;
  }
  
  const chat = state.chats.find(c => c.id === state.currentChatId);
  if (!chat) return;
  
  const content = `# ${chat.title}\n\n` + 
    chat.messages.map(msg => {
      const role = msg.role === 'user' ? 'You' : 'Cobra AI';
      const time = new Date(msg.timestamp).toLocaleString();
      return `## ${role} (${time})\n${msg.content}\n`;
    }).join('\n---\n\n');
  
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${chat.title.replace(/[^a-z0-9]/gi, '_')}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function autoResizeTextarea(e) {
  const textarea = e.target;
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

function scrollToBottom() {
  const chatArea = document.getElementById('chatArea');
  setTimeout(() => {
    chatArea.scrollTop = chatArea.scrollHeight;
  }, 100);
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }
  
  return 'Just now';
}

// ============================================
// DEMO DATA
// ============================================
function createDemoChats() {
  const demoChats = [
    {
      id: generateId(),
      title: 'Welcome to Cobra AI',
      category: 'personal',
      messages: [
        {
          id: generateId(),
          role: 'user',
          content: 'Hello! What can you help me with?',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: generateId(),
          role: 'assistant',
          content: 'Welcome to Cobra AI! I\'m your intelligent assistant powered by advanced AI. I can help you with a wide range of tasks including answering questions, writing content, coding assistance, data analysis, and much more. How can I assist you today?',
          timestamp: new Date(Date.now() - 3500000).toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3500000).toISOString()
    },
    {
      id: generateId(),
      title: 'JavaScript Best Practices',
      category: 'coding',
      messages: [
        {
          id: generateId(),
          role: 'user',
          content: 'What are some JavaScript best practices for 2024?',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: generateId(),
          role: 'assistant',
          content: 'Here are key JavaScript best practices for 2024:\n\n1. Use modern ES6+ features (arrow functions, destructuring, async/await)\n2. Implement proper error handling with try-catch\n3. Write modular, reusable code\n4. Use TypeScript for type safety\n5. Follow consistent naming conventions\n6. Optimize performance with debouncing and memoization\n7. Keep dependencies updated\n8. Write comprehensive tests\n\nWould you like me to elaborate on any of these?',
          timestamp: new Date(Date.now() - 7100000).toISOString()
        }
      ],
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      updatedAt: new Date(Date.now() - 7100000).toISOString()
    }
  ];
  
  state.chats = demoChats;
  saveStateToStorage();
  renderChatList();
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + K: Focus search
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    document.getElementById('searchInput').focus();
  }
  
  // Ctrl/Cmd + N: New chat
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault();
    createNewChat();
  }
  
  // Ctrl/Cmd + /: Toggle sidebar (mobile)
  if ((e.ctrlKey || e.metaKey) && e.key === '/') {
    e.preventDefault();
    toggleSidebar();
  }
});
