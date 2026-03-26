# Product Requirements Document (PRD): Pulse Studio

## 1. Overview
Pulse Studio is a purely client-side, AI-powered podcast generation studio. It allows users to curate news topics, fetch the latest news using various LLMs, generate a conversational podcast script, and synthesize it into an audio podcast using TTS models. It also features automation capabilities for daily hands-free generation.

## 2. Target Audience
- Professionals wanting quick daily briefings.
- Commuters who prefer listening to personalized news.
- Automation enthusiasts (Tasker, MacroDroid users).

## 3. Core Features
### 3.1. Topic Management
- Add, edit, delete, and reorder news topics.
- Enable/disable specific topics.
- Assign percentage weights to topics for time distribution.

### 3.2. AI Provider Integration
- **News Fetcher & Script Writer**: Support for Groq, Gemini, Claude, OpenAI, and Custom Endpoints.
- **Voice Generator**: Support for Gemini TTS, ElevenLabs, Murf.ai, Audixa, and Custom Endpoints.
- **Custom Providers**: Ability to add custom API endpoints with configurable payloads and response paths.

### 3.3. Podcast Generation
- Configurable duration (2 to 30 minutes).
- Configurable number of hosts (1 to 3) with customizable names and voices.
- Personalized pretext/introduction.
- Real-time status tracking of the generation process (News -> Script -> Audio).

### 3.4. WhatsApp Integration
- Generate a formatted WhatsApp news summary alongside the podcast.
- Sending methods: Direct Link (`wa.me`), Background Webhook, or CallMeBot (Send to Self).
- Auto-send capabilities.

### 3.5. Automation
- **PWA Reminders**: Browser-based daily notifications.
- **MacroDroid/Tasker**: Support for local HTML file execution or Webhook URL triggers (`?auto=1`).
- Auto-generate, auto-download, and auto-send WhatsApp messages on launch.

## 4. Non-Functional Requirements
- **Privacy**: All API keys and configurations are stored locally in the browser (`localStorage`).
- **Performance**: Fast loading, responsive UI.
- **Offline Capability**: The app UI should load offline (PWA), though generation requires an internet connection.
