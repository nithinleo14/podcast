# Product Requirements Document (PRD) - Pulse Studio

## 1. Project Overview
**Pulse Studio** is a personal, AI-powered podcast production suite designed for high-efficiency daily news consumption. It automates the entire workflow: from researching trending topics to writing conversational scripts and generating high-quality multi-host audio.

The goal is to provide a "hands-free" news experience that feels like a professional morning radio show, personalized to the user's interests.

## 2. Target Audience
- **Busy Professionals:** Who want to stay updated during commutes or workouts.
- **Tech Enthusiasts:** Interested in specific niches like AI, Crypto, or Markets.
- **Automation Power Users:** Who want to integrate their news consumption into their existing smart home or mobile workflows.

## 3. Key Features

### 3.1. Multi-Agent AI Workflow
- **News Researcher:** Scrapes and summarizes the latest news based on user-defined topics.
- **Script Writer:** Transforms raw news into a conversational, engaging script for multiple hosts.
- **Voice Generator:** Uses advanced TTS (Text-to-Speech) to produce natural-sounding audio with distinct personalities.

### 3.2. Personalization
- **Custom Topics:** Users can add, enable/disable, and prioritize topics.
- **Host Personalities:** Choose from different voices and names for the podcast hosts.
- **User Context:** The AI addresses the user by name and follows specific pretext instructions.

### 3.3. Multi-Provider Support
- **LLM Providers:** Support for Groq (Llama 3), Gemini (Flash/Pro), Claude, and OpenAI.
- **TTS Providers:** Support for Gemini TTS (Multi-speaker), ElevenLabs, Murf, and Audixa.
- **Custom API Integration:** Ability to add any OpenAI-compatible or custom REST API provider.

### 3.4. Automation & Integration
- **PWA Support:** Installable as a mobile app with scheduled reminders.
- **MacroDroid/Tasker Integration:** Trigger generation via local automation apps.
- **WhatsApp Integration:** Automatically send a text summary of the podcast to a specific number.
- **Auto-Download:** Option to automatically save the generated MP3 to the device.

## 4. User Interface (UI)
- **Modern Dashboard:** Clean, dark-themed interface with intuitive navigation.
- **Real-time Logs:** Visual feedback of the AI agents' progress.
- **Interactive Script Viewer:** Read the generated script with host-specific highlighting.
- **Audio Player:** Built-in player with metadata display.

## 5. Technical Stack
- **Frontend:** React, TypeScript, Tailwind CSS, Lucide Icons.
- **Animations:** Motion (Framer Motion).
- **AI Integration:** Google Gemini SDK, Fetch API for external providers.
- **State Management:** React Hooks (useState, useEffect) with LocalStorage persistence.

## 6. Future Roadmap
- **RSS Feed Generation:** Allow users to subscribe to their personal podcast in any player.
- **Image Generation:** Create custom cover art for each episode.
- **Interactive Q&A:** Allow users to ask follow-up questions about the news topics.
- **Cloud Sync:** Sync settings and topics across devices.
