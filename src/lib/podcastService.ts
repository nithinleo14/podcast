import { GoogleGenAI, Modality } from "@google/genai";
import { 
  Topic, 
  LLMProvider, 
  TTSProvider, 
  CustomProvider, 
  PodcastConfig 
} from "../types";
import { AGENT_PROMPTS } from "./prompts";

/**
 * Pulse Studio - Core Services
 * 
 * This file handles the heavy lifting of communicating with various AI providers.
 * It abstracts the complexity of different API formats into a unified interface.
 */

export async function generatePodcastAudio(script: string, config: PodcastConfig) {
  const custom = config.customProviders.find(p => p.id === config.voiceGeneratorProvider);
  
  if (custom) {
    // Handle Custom TTS
    const payload = JSON.parse(custom.payloadTemplate || '{}');
    const replaceText = (obj: any): any => {
      if (typeof obj === 'string') return obj.replace('{{text}}', script);
      if (Array.isArray(obj)) return obj.map(replaceText);
      if (typeof obj === 'object' && obj !== null) {
        const newObj: any = {};
        for (const key in obj) newObj[key] = replaceText(obj[key]);
        return newObj;
      }
      return obj;
    };
    const finalPayload = replaceText(payload);
    
    const headers: any = { 'Content-Type': 'application/json' };
    if (custom.apiKey && custom.authHeader) {
      headers[custom.authHeader] = (custom.authPrefix || '') + custom.apiKey;
    }

    const res = await fetch(custom.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(finalPayload)
    });

    if (!res.ok) throw new Error(`Custom TTS Error: ${res.statusText}`);
    
    const data = await res.json();
    const resolvePath = (obj: any, path: string) => {
      return path.split(/[.[\]]/).filter(Boolean).reduce((acc, part) => acc && acc[part], obj);
    };
    const audioData = resolvePath(data, custom.responsePath || '');
    
    if (!audioData) throw new Error("Could not find audio data in custom response");
    
    return {
      data: audioData,
      mimeType: 'audio/mpeg'
    };
  }

  if (config.voiceGeneratorProvider === 'gemini-tts') {
    const placeholders = ['MY_GEMINI_API_KEY', 'undefined', 'null', ''];
    const userKey = config.geminiKey && !placeholders.includes(config.geminiKey) ? config.geminiKey : null;
    const sysKey = process.env.GEMINI_API_KEY && !placeholders.includes(process.env.GEMINI_API_KEY) ? process.env.GEMINI_API_KEY : null;
    const key = userKey || sysKey;
    
    if (!key) throw new Error("Gemini API Key is missing or invalid for TTS.");

    const geminiAi = new GoogleGenAI({ apiKey: key });
    const hostNames = config.hosts.slice(0, config.numHosts).map(h => h.name);
    const prompt = AGENT_PROMPTS.voiceGenerator(hostNames) + "\n\n" + script;

    const speakerVoiceConfigs = config.hosts.slice(0, config.numHosts).map(h => ({
      speaker: h.name,
      voiceConfig: {
        prebuiltVoiceConfig: { voiceName: h.geminiVoice as any },
      },
    }));

    const response = await geminiAi.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: speakerVoiceConfigs,
          },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (!part?.inlineData?.data) throw new Error("Failed to generate audio data from Gemini TTS");

    return {
      data: part.inlineData.data,
      mimeType: part.inlineData.mimeType || 'audio/pcm;rate=24000'
    };
  }
  
  throw new Error(`Unsupported voice generator provider: ${config.voiceGeneratorProvider}`);
}

export async function callLLM(provider: LLMProvider, prompt: string, config: PodcastConfig) {
  const custom = config.customProviders.find(p => p.id === provider);
  if (custom) {
    const payload = JSON.parse(custom.payloadTemplate || '{}');
    const replacePrompt = (obj: any): any => {
      if (typeof obj === 'string') return obj.replace('{{prompt}}', prompt);
      if (Array.isArray(obj)) return obj.map(replacePrompt);
      if (typeof obj === 'object' && obj !== null) {
        const newObj: any = {};
        for (const key in obj) newObj[key] = replacePrompt(obj[key]);
        return newObj;
      }
      return obj;
    };
    const finalPayload = replacePrompt(payload);

    const headers: any = { 'Content-Type': 'application/json' };
    if (custom.apiKey && custom.authHeader) {
      headers[custom.authHeader] = (custom.authPrefix || '') + custom.apiKey;
    }

    const res = await fetch(custom.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(finalPayload)
    });

    if (!res.ok) throw new Error(`Custom LLM Error: ${res.statusText}`);
    
    const data = await res.json();
    const resolvePath = (obj: any, path: string) => {
      return path.split(/[.[\]]/).filter(Boolean).reduce((acc, part) => acc && acc[part], obj);
    };
    return resolvePath(data, custom.responsePath || '') || "";
  }

  switch (provider) {
    case 'groq':
      return callGroq(config.groqKey, prompt);
    case 'gemini-flash':
      return callGemini(config.geminiKey, prompt, 'gemini-3-flash-preview');
    case 'gemini-pro':
      return callGemini(config.geminiKey, prompt, 'gemini-3.1-pro-preview');
    case 'claude':
      return callClaude(config.claudeKey, prompt);
    case 'openai':
      return callOpenAI(config.openaiKey, prompt);
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}

async function callGemini(apiKey: string, prompt: string, model: string) {
  const placeholders = ['MY_GEMINI_API_KEY', 'undefined', 'null', ''];
  const userKey = apiKey && !placeholders.includes(apiKey) ? apiKey : null;
  const sysKey = process.env.GEMINI_API_KEY && !placeholders.includes(process.env.GEMINI_API_KEY) ? process.env.GEMINI_API_KEY : null;
  const key = userKey || sysKey;
  
  if (!key) {
    throw new Error("Gemini API Key is missing or invalid. Please check your settings.");
  }
  const geminiAi = new GoogleGenAI({ apiKey: key });
  const response = await geminiAi.models.generateContent({
    model: model,
    contents: prompt,
  });
  return response.text || "";
}

async function callClaude(apiKey: string, prompt: string) {
  if (!apiKey) throw new Error("Claude API Key is required");
  // Using fetch to avoid extra dependencies
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'dangerously-allow-browser': 'true' // Note: In a real app, this should be server-side
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(`Claude Error: ${error.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text || "";
}

async function callOpenAI(apiKey: string, prompt: string) {
  if (!apiKey) throw new Error("OpenAI API Key is required");
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(`OpenAI Error: ${error.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function callGroq(apiKey: string, prompt: string) {
  if (!apiKey) throw new Error("Groq API Key is required");
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 4096
    })
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(`Groq Error: ${error.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function testProviderConnection(provider: CustomProvider) {
  try {
    const payload = JSON.parse(provider.payloadTemplate || '{}');
    const replaceTest = (obj: any): any => {
      if (typeof obj === 'string') return obj.replace('{{prompt}}', 'test').replace('{{text}}', 'test');
      if (Array.isArray(obj)) return obj.map(replaceTest);
      if (typeof obj === 'object' && obj !== null) {
        const newObj: any = {};
        for (const key in obj) newObj[key] = replaceTest(obj[key]);
        return newObj;
      }
      return obj;
    };
    const finalPayload = replaceTest(payload);

    const headers: any = { 'Content-Type': 'application/json' };
    if (provider.apiKey && provider.authHeader) {
      headers[provider.authHeader] = (provider.authPrefix || '') + provider.apiKey;
    }

    const res = await fetch(provider.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(finalPayload)
    });

    return res.ok;
  } catch (e) {
    console.error("Test connection failed", e);
    return false;
  }
}
