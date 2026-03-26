# Pulse Studio 🎙️

Your personal AI-powered podcast studio that runs entirely in your browser. Pulse Studio fetches the latest news on your favorite topics, writes a conversational script, and generates an audio podcast—all automatically.

## Features
- **Multi-LLM Support**: Use Groq, Gemini, Claude, OpenAI, or your own custom endpoints.
- **Multi-Host Audio**: Generate podcasts with up to 3 distinct AI hosts.
- **WhatsApp Integration**: Automatically get a text summary sent to your WhatsApp via CallMeBot or Webhooks.
- **Full Automation**: Trigger daily generations using MacroDroid, Tasker, iOS Shortcuts, or PWA reminders.
- **Privacy First**: All API keys and settings are stored locally in your browser.

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Configuration
1. Open the app in your browser.
2. Navigate to the **Settings** tab.
3. Enter your API keys for the providers you wish to use (e.g., Gemini, Groq).
4. Configure your hosts and personalization settings.

## Automation Guide
Pulse Studio is designed to be automated. You can trigger a generation silently by opening the app with the `?auto=1` query parameter.

### Using MacroDroid (Android)
1. Download the Automation HTML file from the **Automate** tab.
2. In MacroDroid, create a macro that triggers at your desired time.
3. Add the action: `Open Website / HTTP GET` and point it to the local HTML file or your hosted URL with `?auto=1`.
4. Ensure "Auto-Generate on Launch" is enabled in Pulse Studio settings.

### WhatsApp "Send to Me"
1. Get an API key from `@CallMeBot_WhatsApp` on Telegram/WhatsApp.
2. In Settings > WhatsApp Integration, select **CallMeBot**.
3. Enter your API key and phone number.
4. Enable Auto-Send in the Automate tab.

## Tech Stack
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Google Gen AI SDK
