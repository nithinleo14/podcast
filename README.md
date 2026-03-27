# 🎙️ Pulse Studio: Your Personal AI Podcast Production Suite

**Pulse Studio** is a high-efficiency news consumption tool that automates the entire podcast production workflow. From researching trending topics to writing conversational scripts and generating high-quality multi-host audio, Pulse Studio provides a professional morning radio show experience personalized to your interests.

## 🚀 Key Features

- **Multi-Agent AI Workflow:** 
  - **News Researcher:** Scrapes and summarizes the latest news based on your topics.
  - **Script Writer:** Transforms raw news into an engaging script for multiple hosts.
  - **Voice Generator:** Produces natural-sounding audio with distinct personalities.
- **Personalization:**
  - **Custom Topics:** Add, enable/disable, and prioritize topics.
  - **Host Personalities:** Choose from different voices and names for your hosts.
  - **User Context:** The AI addresses you by name and follows your instructions.
- **Multi-Provider Support:**
  - **LLM Providers:** Groq (Llama 3), Gemini (Flash/Pro), Claude, OpenAI.
  - **TTS Providers:** Gemini TTS (Multi-speaker), ElevenLabs, Murf, Audixa.
  - **Custom API Integration:** Add any OpenAI-compatible or custom REST API provider.
- **Automation & Integration:**
  - **PWA Support:** Install as a mobile app with scheduled reminders.
  - **MacroDroid/Tasker Integration:** Trigger generation via local automation apps.
  - **WhatsApp Integration:** Automatically send a text summary of the podcast.
  - **Auto-Download:** Automatically save the generated MP3 to your device.

## 🛠️ Getting Started

### 1. Configure Your AI Providers
Go to the **Settings** tab and enter your API keys for the providers you want to use.
- **Gemini API Key:** Required for the default voice generation and Gemini LLM models.
- **Groq API Key:** Recommended for fast and high-quality news fetching and script writing.

### 2. Set Your Topics
In the **Topics** tab, enable the topics you're interested in or add your own custom topics. You can also adjust the weightage (percentage) of each topic.

### 3. Generate Your First Podcast
Go to the **Generate** tab, set your desired duration, and click **Generate Podcast**. You can follow the progress of the AI agents in the real-time logs.

### 4. Listen and Share
Once generated, you can listen to the podcast directly in the app, download the MP3, or send a summary to WhatsApp.

## 📱 Automation Setup

Pulse Studio is designed to work seamlessly with mobile automation tools like **MacroDroid** or **Tasker**. 

### Using MacroDroid (Android)
1. Download the **Automation HTML** file from the **Guide** tab.
2. In MacroDroid, create a macro with a **Time of Day** trigger.
3. Add an **Open Website** action and select the downloaded HTML file.
4. This will automatically open Pulse Studio and start the generation process at the scheduled time.

## 🏗️ Project Structure

- `src/App.tsx`: Main application component and state management.
- `src/components/`: Modular UI components (Header, Navigation, Panels, etc.).
- `src/lib/`: Core logic, constants, and AI service abstractions.
- `src/types/`: TypeScript interfaces and type definitions.
- `src/hooks/`: Custom React hooks for state persistence.

## 📄 License

This project is licensed under the MIT License.
