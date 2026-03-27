/**
 * Pulse Studio - AI Agent Prompts
 * 
 * This file contains the system instructions and prompt templates for the three main agents:
 * 1. News Fetcher: Researches the latest news for given topics.
 * 2. Script Writer: Converts news data into a conversational podcast script.
 * 3. Voice Generator: Instructions for TTS models (if applicable).
 */

export const AGENT_PROMPTS = {
  /**
   * Agent 1: News Fetcher
   * Responsible for gathering specific, recent, and relevant news stories.
   */
  newsFetcher: (topics: string[]) => `
    You are a professional news researcher. 
    Today is ${new Date().toDateString()}. 
    Find the LATEST important news for each topic below: 
    ${topics.join(', ')}. 
    Provide 3-5 specific stories for each. 
    Focus on facts, dates, and key figures.
  `.trim(),

  /**
   * Agent 2: Script Writer
   * Responsible for converting raw news data into a natural, engaging podcast script.
   */
  scriptWriter: (params: {
    podcastName: string;
    numHosts: number;
    duration: number;
    newsData: string;
    userName: string;
    pretext: string;
    whatsappEnabled: boolean;
  }) => {
    const personalizedPretext = params.pretext.replace(/\[name\]/gi, params.userName);
    
    return `
      ${personalizedPretext ? `START THE PODCAST WITH THIS INTRODUCTION: "${personalizedPretext}"` : ''}
      
      Write a ${params.duration}-minute podcast script for "${params.podcastName}" with ${params.numHosts} hosts. 
      The script should be conversational, engaging, and natural. 
      Use the following news data as the primary source:
      
      --- NEWS DATA START ---
      ${params.newsData}
      --- NEWS DATA END ---

      ${params.whatsappEnabled ? `
      ALSO, write a short, engaging WhatsApp message summarizing this news in a "WhatsApp News" format.
      - Use emojis to make it visually appealing.
      - Use bullet points for readability.
      - Include a catchy headline.
      
      IMPORTANT: Separate the podcast script and the WhatsApp message with exactly this separator: ---WHATSAPP---
      ` : ''}
    `.trim();
  },

  /**
   * Agent 3: Voice Generator (TTS Instructions)
   * Used when the TTS model supports multi-speaker instructions via text.
   */
  voiceGenerator: (hostNames: string[]) => `
    TTS the following conversation between ${hostNames.join(', ')}.
    Ensure each speaker's name is clearly mapped to their dialogue.
  `.trim(),
};
