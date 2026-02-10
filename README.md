# CobrΔ AI - React

Converted from static HTML/JS to a modern React application.

## Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    - Rename `.env.example` to `.env` (or create `.env`).
    - Add your API key:
      ```env
      VITE_API_KEY=your_openai_api_key_here
      ```

3.  **Run Locally:**
    ```bash
    npm run dev
    ```

## Features

- **React + Vite:** Fast, modern development environment.
- **Tailwind CSS:** Custom styling matching the original design.
- **State Management:** Custom hook `useChat` for managing chats and messages.
- **Persistence:** Chats and settings are saved to `localStorage`.
- **Markdown Support:** Messages support code highlighting and markdown formatting.
- **Theme:** Dark/Light mode support.
- **API Integration:** Connects to OpenAI (or compatible) API using environment variables.

## Structure

- `src/components/`: UI Components (Sidebar, ChatArea, Message).
- `src/hooks/`: Custom hooks (useChat).
- `src/utils/`: Utility functions (API client).
- `src/index.css`: Tailwind and custom styles.
