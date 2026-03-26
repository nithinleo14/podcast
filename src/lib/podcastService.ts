import { GoogleGenAI, Modality } from "@google/genai";

// Note: We create a new instance per request to ensure the latest API key is used
// from the config or environment.

export interface Topic {
  id: string;
  emoji: string;
  text: string;
  enabled: boolean;
  percentage: number;
}

export type LLMProvider = 'groq' | 'gemini-flash' | 'gemini-pro' | 'claude' | 'openai' | string;
export type TTSProvider = 'gemini-tts' | 'elevenlabs' | 'murf' | 'audixa' | string;

export interface CustomProvider {
  id: string;
  name: string;
  type: 'llm' | 'tts';
  url: string;
  apiKey?: string;
  authHeader?: string;
  authPrefix?: string;
  payloadTemplate?: string;
  responsePath?: string;
}

export interface HostConfig {
  name: string;
  geminiVoice: string;
  elevenLabsVoice: string;
  murfVoice: string;
  audixaVoice: string;
}

export interface PodcastConfig {
  duration: number;
  numHosts: number;
  hosts: HostConfig[];
  podcastName: string;
  
  // Provider Selection
  newsFetcherProvider: LLMProvider;
  scriptWriterProvider: LLMProvider;
  voiceGeneratorProvider: TTSProvider;

  // API Keys
  groqKey: string;
  geminiKey: string;
  claudeKey: string;
  openaiKey: string;
  elevenLabsKey: string;
  murfKey: string;
  audixaKey: string;

  // Custom Providers
  customProviders: CustomProvider[];

  // Automation
  autoGenerate: boolean;
  lastGeneratedDate?: string;
  pwaEnabled: boolean;
  pwaTime: string;
  pwaDays: number[]; // 0-6 for Sun-Sat
  pwaNotifications: boolean;
  automationMethods: ('pwa' | 'macrodroid' | 'webhook' | 'shortcuts' | 'automate')[];

  // User Personalization
  userName: string;
  pretext: string;
}

export async function generatePodcastAudio(script: string, config: PodcastConfig) {
  const custom = config.customProviders.find(p => p.id === config.voiceGeneratorProvider);
  
  if (custom) {
    // Handle Custom TTS
    const payload = JSON.parse(custom.payloadTemplate || '{}');
    // Replace {{text}} in payload recursively
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
    // Resolve response path (e.g. "audio.url")
    const resolvePath = (obj: any, path: string) => {
      return path.split(/[.[\]]/).filter(Boolean).reduce((acc, part) => acc && acc[part], obj);
    };
    const audioData = resolvePath(data, custom.responsePath || '');
    
    if (!audioData) throw new Error("Could not find audio data in custom response");
    
    return {
      data: audioData, // Expecting base64 or URL depending on provider
      mimeType: 'audio/mpeg' // Default assumption
    };
  }

  if (config.voiceGeneratorProvider === 'gemini-tts') {
    // Use the Gemini TTS model
    const key = config.geminiKey || process.env.GEMINI_API_KEY;
    if (!key || key === 'undefined' || key === 'MY_GEMINI_API_KEY') {
      throw new Error("Gemini API Key is missing or invalid for TTS. Please check your settings.");
    }
    const geminiAi = new GoogleGenAI({ apiKey: key });
    const hostNames = config.hosts.slice(0, config.numHosts).map(h => h.name).join(', ');
    const prompt = `TTS the following conversation between ${hostNames}:
${script}`;

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
    if (!part?.inlineData?.data) {
      console.error("Gemini TTS Response:", response);
      throw new Error("Failed to generate audio data from Gemini TTS");
    }

    return {
      data: part.inlineData.data,
      mimeType: part.inlineData.mimeType || 'audio/pcm;rate=24000'
    };
  } else if (config.voiceGeneratorProvider === 'elevenlabs') {
    // ElevenLabs: generate audio per host line and concatenate
    const key = config.elevenLabsKey;
    if (!key) throw new Error("ElevenLabs API Key is missing. Please add it in Settings.");

    const hosts = config.hosts.slice(0, config.numHosts);
    const lines = script.split('\n').map(l => l.trim()).filter(Boolean);
    const segments: { voiceId: string; text: string }[] = [];

    for (const line of lines) {
      for (const host of hosts) {
        if (line.startsWith(host.name + ':')) {
          const text = line.slice(host.name.length + 1).trim();
          const voiceId = host.elevenLabsVoice;
          if (!voiceId) throw new Error(`ElevenLabs Voice ID missing for host "${host.name}". Please add it in Settings → Voices.`);
          if (text.length > 2) segments.push({ voiceId, text });
          break;
        }
      }
    }

    if (!segments.length) throw new Error('Could not parse any dialogue from script. Check host names match exactly.');

    const chunks: ArrayBuffer[] = [];
    for (const seg of segments) {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${seg.voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': key,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify({
          text: seg.text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.82, style: 0.3, use_speaker_boost: true }
        })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`ElevenLabs Error: ${errText.slice(0, 200)}`);
      }
      chunks.push(await res.arrayBuffer());
    }

    // Combine all MP3 chunks into a single base64 string
    const totalLen = chunks.reduce((s, c) => s + c.byteLength, 0);
    const combined = new Uint8Array(totalLen);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(new Uint8Array(chunk), offset);
      offset += chunk.byteLength;
    }
    const base64 = btoa(String.fromCharCode(...combined));
    return { data: base64, mimeType: 'audio/mpeg' };

  } else if (config.voiceGeneratorProvider === 'murf') {
    // Murf.ai: single-speaker TTS using their REST API
    const key = config.murfKey;
    if (!key) throw new Error("Murf API Key is missing. Please add it in Settings.");

    const hosts = config.hosts.slice(0, config.numHosts);

    // Parse lines per host and pick voice
    const lines = script.split('\n').map(l => l.trim()).filter(Boolean);
    const segments: { voiceId: string; text: string }[] = [];

    for (const line of lines) {
      for (const host of hosts) {
        if (line.startsWith(host.name + ':')) {
          const text = line.slice(host.name.length + 1).trim();
          const voiceId = host.murfVoice || 'en-IN-rohan'; // default Indian English voice
          if (text.length > 2) segments.push({ voiceId, text });
          break;
        }
      }
    }

    if (!segments.length) throw new Error('Could not parse dialogue from script for Murf TTS.');

    const chunks: ArrayBuffer[] = [];
    for (const seg of segments) {
      const res = await fetch('https://api.murf.ai/v1/speech/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': key
        },
        body: JSON.stringify({
          voiceId: seg.voiceId,
          text: seg.text,
          format: 'MP3',
          sampleRate: 24000,
          channelType: 'MONO'
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Murf Error: ${errText.slice(0, 200)}`);
      }

      const data = await res.json();
      // Murf returns an audioFile URL — fetch and convert
      if (!data.audioFile) throw new Error('Murf returned no audio URL.');
      const audioRes = await fetch(data.audioFile);
      if (!audioRes.ok) throw new Error('Failed to download Murf audio file.');
      chunks.push(await audioRes.arrayBuffer());
    }

    const totalLen = chunks.reduce((s, c) => s + c.byteLength, 0);
    const combined = new Uint8Array(totalLen);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(new Uint8Array(chunk), offset);
      offset += chunk.byteLength;
    }
    const base64 = btoa(String.fromCharCode(...combined));
    return { data: base64, mimeType: 'audio/mpeg' };

  } else if (config.voiceGeneratorProvider === 'audixa') {
    // Audixa.ai: REST TTS API — generates per-segment audio
    const key = config.audixaKey;
    if (!key) throw new Error("Audixa API Key is missing. Please add it in Settings.");

    const hosts = config.hosts.slice(0, config.numHosts);
    const lines = script.split('\n').map(l => l.trim()).filter(Boolean);
    const segments: { voiceId: string; text: string }[] = [];

    for (const line of lines) {
      for (const host of hosts) {
        if (line.startsWith(host.name + ':')) {
          const text = line.slice(host.name.length + 1).trim();
          const voiceId = host.audixaVoice;
          if (!voiceId) throw new Error(`Audixa Voice ID missing for host "${host.name}". Please add it in Settings → Voices.`);
          if (text.length > 2) segments.push({ voiceId, text });
          break;
        }
      }
    }

    if (!segments.length) throw new Error('Could not parse dialogue from script for Audixa TTS.');

    const chunks: ArrayBuffer[] = [];
    for (const seg of segments) {
      const res = await fetch('https://api.audixa.ai/v1/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          voice_id: seg.voiceId,
          text: seg.text,
          output_format: 'mp3'
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Audixa Error: ${errText.slice(0, 200)}`);
      }

      // Audixa may return raw audio bytes or JSON with base64
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        // Try common response shapes: data.audio, data.audio_content, data.result
        const b64 = data.audio || data.audio_content || data.result || data.data;
        if (!b64) throw new Error('Audixa returned JSON but no recognisable audio field.');
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        chunks.push(bytes.buffer);
      } else {
        // Raw audio bytes
        chunks.push(await res.arrayBuffer());
      }
    }

    const totalLen = chunks.reduce((s, c) => s + c.byteLength, 0);
    const combined = new Uint8Array(totalLen);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(new Uint8Array(chunk), offset);
      offset += chunk.byteLength;
    }
    const base64 = btoa(String.fromCharCode(...combined));
    return { data: base64, mimeType: 'audio/mpeg' };
  }
  
  throw new Error("Unsupported voice generator provider");
}

export async function callLLM(provider: LLMProvider, prompt: string, config: PodcastConfig) {
  const custom = config.customProviders.find(p => p.id === provider);
  if (custom) {
    // Handle Custom LLM
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
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key || key === 'undefined' || key === 'MY_GEMINI_API_KEY') {
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
