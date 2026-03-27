import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { GoogleGenAI, Modality } from "@google/genai";

// Types & Constants
import { 
  Topic, 
  PodcastConfig, 
  CustomProvider,
  LLMProvider,
  TTSProvider
} from './types';
import { 
  DEFAULT_TOPICS, 
  VOICES,
  DEFAULT_CONFIG 
} from './lib/constants';
import { AGENT_PROMPTS } from './lib/prompts';

// Utils & Services
import { 
  pcmToWav, 
  formatDate 
} from './lib/utils';
import { 
  callLLM,
  generatePodcastAudio,
  testProviderConnection
} from './lib/podcastService';

// Components
import { Layout } from './components/Layout';
import { GeneratePanel } from './components/GeneratePanel';
import { TopicsPanel } from './components/TopicsPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { AutomatePanel } from './components/AutomatePanel';
import { CustomProviderModal } from './components/CustomProviderModal';

export default function App() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'generate' | 'topics' | 'settings' | 'guide'>('generate');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('dp_theme') as 'dark' | 'light') || 'dark');
  const [topics, setTopics] = useState<Topic[]>(() => {
    const saved = localStorage.getItem('dp_topics');
    if (!saved) return DEFAULT_TOPICS;
    try { return JSON.parse(saved); } catch { return DEFAULT_TOPICS; }
  });
  
  const [config, setConfig] = useState<PodcastConfig>(() => {
    const saved = localStorage.getItem('dp_config');
    if (!saved) return DEFAULT_CONFIG;
    try { return { ...DEFAULT_CONFIG, ...JSON.parse(saved) }; } catch { return DEFAULT_CONFIG; }
  });

  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<{ msg: string; cls?: string }[]>([]);
  const [agentStates, setAgentStates] = useState({ news: '', script: '', voice: '' });
  const [agentMsgs, setAgentMsgs] = useState({ news: 'Waiting...', script: 'Waiting...', voice: 'Waiting...' });
  const [script, setScript] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [audioMeta, setAudioMeta] = useState('');
  const [saveStatus, setSaveStatus] = useState<{ tab: string; show: boolean }>({ tab: '', show: false });
  const [openSettings, setOpenSettings] = useState<string | null>('providers');
  const [editingCustom, setEditingCustom] = useState<CustomProvider | null>(null);
  const [testStatus, setTestStatus] = useState<{ loading: boolean; error?: string; success?: string } | null>(null);
  const [isPlayingSample, setIsPlayingSample] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);

  // --- EFFECTS ---
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('dp_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('dp_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('dp_topics', JSON.stringify(topics));
  }, [topics]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('auto') === '1' && config.autoGenerate) {
      const today = new Date().toISOString().split('T')[0];
      if (config.lastGeneratedDate !== today) {
        handleGenerate(true);
      } else {
        notify('Podcast for today already generated.', 'info');
      }
    }
  }, []);

  useEffect(() => {
    if (!config.pwaEnabled || !config.pwaNotifications) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentDay = now.getDay();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (config.pwaDays.includes(currentDay) && currentTime === config.pwaTime) {
        const today = new Date().toISOString().split('T')[0];
        if (config.lastGeneratedDate !== today) {
          new Notification("🎙️ Pulse Studio", {
            body: "Time to generate your daily podcast! Tap to start.",
            icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎙️</text></svg>"
          }).onclick = () => {
            window.focus();
            handleGenerate();
          };
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [config.pwaEnabled, config.pwaTime, config.pwaNotifications, config.lastGeneratedDate]);

  // --- HANDLERS ---
  const notify = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const addLog = (msg: string, cls: string = '') => {
    setLogs(prev => [...prev, { msg, cls }]);
  };

  const setA = (n: 'news' | 'script' | 'voice', state: string, msg: string) => {
    setAgentStates(prev => ({ ...prev, [n]: state }));
    setAgentMsgs(prev => ({ ...prev, [n]: msg }));
  };

  const handleSave = (tab: string) => {
    if (tab === 'topics') {
      localStorage.setItem('dp_topics', JSON.stringify(topics));
    } else if (tab === 'settings') {
      localStorage.setItem('dp_config', JSON.stringify(config));
    }
    setSaveStatus({ tab, show: true });
    setTimeout(() => setSaveStatus({ tab: '', show: false }), 2000);
    notify('Changes saved successfully', 'success');
  };

  const handleTestConnection = async (p?: CustomProvider) => {
    const target = p || editingCustom;
    if (!target) return;
    setTestStatus({ loading: true });
    try {
      const success = await testProviderConnection(target);
      if (success) {
        setTestStatus({ loading: false, success: 'Connection Successful!' });
        notify('Connection Successful!', 'success');
      } else {
        setTestStatus({ loading: false, error: 'Connection failed.' });
        notify('Connection failed.', 'error');
      }
    } catch (err: any) {
      setTestStatus({ loading: false, error: err.message });
      notify(`Connection Failed: ${err.message}`, 'error');
    }
  };

  const playVoiceSample = async (voiceName: string) => {
    if (isPlayingSample) return;
    setIsPlayingSample(voiceName);
    try {
      const placeholders = ['MY_GEMINI_API_KEY', 'undefined', 'null', ''];
      const userKey = config.geminiKey && !placeholders.includes(config.geminiKey) ? config.geminiKey : null;
      const sysKey = process.env.GEMINI_API_KEY && !placeholders.includes(process.env.GEMINI_API_KEY) ? process.env.GEMINI_API_KEY : null;
      const key = userKey || sysKey;
      
      if (!key) throw new Error("Gemini API Key is missing or invalid.");

      const geminiAi = new GoogleGenAI({ apiKey: key });
      const response = await geminiAi.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Hello! I am ${voiceName}. This is how I sound.` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName as any },
            },
          },
        },
      });
      const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (data) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const binaryString = window.atob(data);
        const len = binaryString.length;
        const bytes = new Int16Array(len / 2);
        for (let i = 0; i < len; i += 2) {
          bytes[i / 2] = (binaryString.charCodeAt(i + 1) << 8) | binaryString.charCodeAt(i);
        }
        const audioBuffer = audioContext.createBuffer(1, bytes.length, 24000);
        const channelData = audioBuffer.getChannelData(0);
        for (let i = 0; i < bytes.length; i++) {
          channelData[i] = bytes[i] / 32768;
        }
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.onended = () => setIsPlayingSample(null);
        source.start();
      } else {
        setIsPlayingSample(null);
      }
    } catch (e) {
      console.error("Sample failed", e);
      setIsPlayingSample(null);
    }
  };

  const handleGenerate = async (isAutoRun = false) => {
    const activeTopics = topics.filter(t => t.enabled);
    if (!activeTopics.length) {
      notify('Enable at least one topic in Topics tab.', 'error');
      setActiveTab('topics');
      return;
    }

    setIsGenerating(true);
    setLogs([]);
    setScript('');
    setWhatsappMessage('');
    setAudioUrl('');
    setA('news', '', 'Waiting...');
    setA('script', '', 'Waiting...');
    setA('voice', '', 'Waiting...');

    try {
      setA('news', 'run', `Searching news using ${config.newsFetcherProvider}...`);
      addLog(`Agent 1 fetching news (${config.newsFetcherProvider})...`, 'lhi');
      
      const newsPrompt = AGENT_PROMPTS.newsFetcher(activeTopics.map(t => t.text));
      const newsData = await callLLM(config.newsFetcherProvider, newsPrompt, config);
      
      setA('news', 'done', '✓ News fetched');
      addLog('News ready: ' + newsData.length + ' chars', 'lok');

      setA('script', 'run', `Writing script using ${config.scriptWriterProvider}...`);
      addLog(`Agent 2 writing script (${config.scriptWriterProvider})...`, 'lhi');
      
      const scriptPrompt = AGENT_PROMPTS.scriptWriter({
        podcastName: config.podcastName,
        numHosts: config.numHosts,
        duration: isAutoRun ? config.autoGenerateDuration : config.duration,
        newsData: newsData,
        userName: config.userName,
        pretext: config.pretext,
        whatsappEnabled: config.whatsappEnabled
      });
      
      const fullResponse = await callLLM(config.scriptWriterProvider, scriptPrompt, config);
      
      let finalScript = fullResponse;
      let finalWhatsapp = '';
      
      if (config.whatsappEnabled && fullResponse.includes('---WHATSAPP---')) {
        const parts = fullResponse.split('---WHATSAPP---');
        finalScript = parts[0].trim();
        finalWhatsapp = parts[1].trim();
      }
      
      setScript(finalScript);
      setWhatsappMessage(finalWhatsapp);
      setA('script', 'done', '✓ Script ready');
      addLog('Script ready: ' + finalScript.split(' ').length + ' words', 'lok');

      setA('voice', 'run', `Generating voices using ${config.voiceGeneratorProvider}...`);
      addLog(`Agent 3 generating audio (${config.voiceGeneratorProvider})...`, 'lhi');
      const audioRes = await generatePodcastAudio(finalScript, config);
      
      let blob: Blob;
      if (audioRes.mimeType.includes('pcm')) {
        const rateMatch = audioRes.mimeType.match(/rate=(\d+)/);
        const rate = rateMatch ? parseInt(rateMatch[1]) : 24000;
        blob = pcmToWav(audioRes.data, rate);
      } else {
        const binaryString = atob(audioRes.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
        blob = new Blob([bytes], { type: audioRes.mimeType });
      }

      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setAudioMeta(`Generated ${new Date().toLocaleString('en-IN')} · ~${isAutoRun ? config.autoGenerateDuration : config.duration} min`);
      setA('voice', 'done', '✓ Audio ready!');
      addLog('🎉 Podcast complete!', 'lok');
      
      const today = new Date().toISOString().split('T')[0];
      setConfig(prev => ({ ...prev, lastGeneratedDate: today }));

      if (isAutoRun || config.autoDownload) {
        const a = document.createElement('a');
        a.href = url;
        a.download = `DailyPod-${today}.mp3`;
        a.click();
      }

      if (config.whatsappEnabled && config.whatsappAutoSend && finalWhatsapp) {
        handleSendWhatsapp(finalWhatsapp);
      }
    } catch (err: any) {
      addLog('Error: ' + err.message, 'lerr');
      setA('news', 'fail', 'Failed');
      setA('script', 'fail', 'Failed');
      setA('voice', 'fail', 'Failed');
      notify(err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendWhatsapp = async (msgOverride?: string) => {
    const msg = msgOverride || whatsappMessage;
    if (!msg) return;
    
    const cleanNumber = config.whatsappNumber.replace(/\D/g, '');
    const encodedMsg = encodeURIComponent(msg);

    if (config.whatsappMethod === 'webhook') {
      if (!config.whatsappWebhookUrl) return;
      try {
        await fetch(config.whatsappWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg, number: config.whatsappNumber })
        });
        notify('WhatsApp sent via Webhook!', 'success');
      } catch (err: any) {
        notify(`Webhook failed: ${err.message}`, 'error');
      }
    } else if (config.whatsappMethod === 'callmebot') {
      if (!config.whatsappApiKey || !config.whatsappNumber) return;
      try {
        const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanNumber}&text=${encodedMsg}&apikey=${config.whatsappApiKey}`;
        await fetch(url, { mode: 'no-cors' });
        notify('WhatsApp sent to your number!', 'success');
      } catch (err: any) {
        notify(`CallMeBot failed: ${err.message}`, 'error');
      }
    } else {
      if (!config.whatsappNumber) return;
      const waUrl = `https://wa.me/${cleanNumber}?text=${encodedMsg}`;
      window.open(waUrl, '_blank');
    }
  };

  const handleCopyWhatsapp = async () => {
    if (!whatsappMessage) return;
    try {
      await navigator.clipboard.writeText(whatsappMessage);
      notify('Message copied to clipboard!', 'success');
    } catch (err) {
      notify('Failed to copy message.', 'error');
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `DailyPod-${new Date().toISOString().split('T')[0]}.mp3`;
    a.click();
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      notify('Notifications enabled!', 'success');
    }
  };

  const downloadAutomationHtml = () => {
    const htmlContent = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${window.location.origin}?auto=1"></head></html>`;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dailypod-ai.html';
    a.click();
  };

  // --- RENDER ---
  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      isDark={theme === 'dark'} 
      setIsDark={(dark) => setTheme(dark ? 'dark' : 'light')}
    >
      {notification && (
        <div className={`toast ${notification.type}`}>
          <span>{notification.msg}</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {activeTab === 'generate' && (
          <motion.div key="generate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GeneratePanel 
              config={config}
              setConfig={setConfig}
              isGenerating={isGenerating}
              handleGenerate={() => handleGenerate()}
              agentStates={agentStates}
              agentMsgs={agentMsgs}
              logs={logs}
              script={script}
              whatsappMessage={whatsappMessage}
              audioUrl={audioUrl}
              audioMeta={audioMeta}
              handleCopyWhatsapp={handleCopyWhatsapp}
              handleSendWhatsapp={() => handleSendWhatsapp()}
              downloadAudio={downloadAudio}
            />
          </motion.div>
        )}

        {activeTab === 'topics' && (
          <motion.div key="topics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TopicsPanel 
              topics={topics}
              setTopics={setTopics}
              handleSave={() => handleSave('topics')}
              saveStatus={saveStatus}
            />
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SettingsPanel 
              config={config}
              setConfig={setConfig}
              openSettings={openSettings}
              setOpenSettings={setOpenSettings}
              handleSave={() => handleSave('settings')}
              saveStatus={saveStatus}
              setEditingCustom={setEditingCustom}
              handleTestConnection={handleTestConnection}
              playVoiceSample={playVoiceSample}
              isPlayingSample={isPlayingSample}
            />
          </motion.div>
        )}

        {activeTab === 'guide' && (
          <motion.div key="automate" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AutomatePanel 
              config={config}
              setConfig={setConfig}
              requestNotificationPermission={requestNotificationPermission}
              downloadAutomationHtml={downloadAutomationHtml}
              notify={notify}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {editingCustom && (
        <CustomProviderModal
          editingCustom={editingCustom}
          setEditingCustom={setEditingCustom}
          config={config}
          setConfig={setConfig}
          testStatus={testStatus as any}
          handleTestConnection={handleTestConnection}
          notify={notify}
        />
      )}
    </Layout>
  );
}
