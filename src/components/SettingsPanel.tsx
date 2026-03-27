import React from 'react';
import { 
  Zap, 
  ChevronDown, 
  Link, 
  CheckCircle, 
  Trash2, 
  PenTool, 
  Mic, 
  User, 
  Smartphone, 
  Save, 
  Check,
  Volume2,
  Plus
} from 'lucide-react';
import { PodcastConfig, LLMProvider, TTSProvider, CustomProvider } from '../types';
import { VOICES } from '../lib/constants';

interface SettingsPanelProps {
  config: PodcastConfig;
  setConfig: (c: PodcastConfig) => void;
  openSettings: string | null;
  setOpenSettings: (s: string | null) => void;
  handleSave: (tab: string) => void;
  saveStatus: { tab: string; show: boolean };
  setEditingCustom: (p: CustomProvider | null) => void;
  handleTestConnection: (p: CustomProvider) => void;
  playVoiceSample: (v: string) => void;
  isPlayingSample: string | null;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  config,
  setConfig,
  openSettings,
  setOpenSettings,
  handleSave,
  saveStatus,
  setEditingCustom,
  handleTestConnection,
  playVoiceSample,
  isPlayingSample
}) => {
  return (
    <div className="panel show">
      <div className="accordion">
        {/* AI Providers */}
        <div className={`acc-item ${openSettings === 'providers' ? 'open' : ''}`}>
          <div className="acc-head" onClick={() => setOpenSettings(openSettings === 'providers' ? null : 'providers')}>
            <div className="ctw">
              <div className="cicon icon-amber"><Zap size={14} /></div>
              <div>
                <div className="ctitle">AI Providers</div>
                <div className="csub">Select engines</div>
              </div>
            </div>
            <ChevronDown className="acc-chevron" size={16} />
          </div>
          <div className="acc-content">
            <div className="field">
              <label>News Fetcher</label>
              <select className="inp" value={config.newsFetcherProvider} onChange={(e) => setConfig({ ...config, newsFetcherProvider: e.target.value as LLMProvider })}>
                <option value="groq">Groq (Llama 3.3) — Free/BYOK</option>
                <option value="gemini-flash">Gemini 3 Flash — Free</option>
                <option value="gemini-pro">Gemini 3.1 Pro — Paid</option>
                <option value="claude">Claude 3.5 Sonnet — Paid</option>
                <option value="openai">GPT-4o — Paid</option>
                {config.customProviders.filter(p => p.type === 'llm').map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Custom)</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Script Writer</label>
              <select className="inp" value={config.scriptWriterProvider} onChange={(e) => setConfig({ ...config, scriptWriterProvider: e.target.value as LLMProvider })}>
                <option value="groq">Groq (Llama 3.3) — Free/BYOK</option>
                <option value="gemini-flash">Gemini 3 Flash — Free</option>
                <option value="gemini-pro">Gemini 3.1 Pro — Paid</option>
                <option value="claude">Claude 3.5 Sonnet — Paid</option>
                <option value="openai">GPT-4o — Paid</option>
                {config.customProviders.filter(p => p.type === 'llm').map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Custom)</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Voice Generator</label>
              <select className="inp" value={config.voiceGeneratorProvider} onChange={(e) => setConfig({ ...config, voiceGeneratorProvider: e.target.value as TTSProvider })}>
                <option value="gemini-tts">Gemini TTS — Free</option>
                <option value="elevenlabs">ElevenLabs — Paid</option>
                <option value="murf">Murf.ai — Paid</option>
                <option value="audixa">Audixa.ai — Paid</option>
                {config.customProviders.filter(p => p.type === 'tts').map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Custom)</option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div className="ctitle">Custom Endpoints</div>
                <button className="btn btn-ghost btn-sm" onClick={() => {
                  setEditingCustom({
                    id: Math.random().toString(36).substr(2, 9),
                    name: '',
                    type: 'llm',
                    url: '',
                    apiKey: '',
                    authHeader: 'Authorization',
                    authPrefix: 'Bearer ',
                    payloadTemplate: '{\n  "model": "...",\n  "messages": [{"role": "user", "content": "{{prompt}}"}]\n}',
                    responsePath: 'choices[0].message.content'
                  });
                }}><Plus size={14} /> Add</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {config.customProviders.map(p => (
                  <div key={p.id} className="custom-p-item">
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '12px' }}>{p.name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text3)' }}>{p.type.toUpperCase()} · {p.url.split('/')[2]}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="btn btn-ghost btn-sm" title="Test Connection" onClick={() => handleTestConnection(p)}><Zap size={12} /></button>
                      <button className="btn btn-ghost btn-sm" title="Edit Provider" onClick={() => setEditingCustom(p)}><PenTool size={12} /></button>
                      <button className="btn btn-ghost btn-sm" title="Delete Provider" onClick={() => setConfig({ ...config, customProviders: config.customProviders.filter(cp => cp.id !== p.id) })}><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className={`acc-item ${openSettings === 'keys' ? 'open' : ''}`}>
          <div className="acc-head" onClick={() => setOpenSettings(openSettings === 'keys' ? null : 'keys')}>
            <div className="ctw">
              <div className="cicon icon-teal"><Link size={14} /></div>
              <div>
                <div className="ctitle">API Keys</div>
                <div className="csub">Connect services</div>
              </div>
            </div>
            <ChevronDown className="acc-chevron" size={16} />
          </div>
          <div className="acc-content">
            <div className="field">
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Gemini API Key</span>
                {process.env.GEMINI_API_KEY && (
                  <span className="badge" style={{ background: 'var(--teal-dim)', color: 'var(--teal)', border: '1px solid rgba(20,184,166,0.2)' }}>
                    System Provided
                  </span>
                )}
              </label>
              <input 
                className="inp" 
                type="password" 
                placeholder={process.env.GEMINI_API_KEY ? "Using System Key" : "Enter Gemini Key"} 
                value={config.geminiKey} 
                onChange={(e) => setConfig({ ...config, geminiKey: e.target.value })} 
              />
              {process.env.GEMINI_API_KEY && !config.geminiKey && (
                <div className="phi" style={{ marginTop: '6px', color: 'var(--teal)' }}>
                  <CheckCircle size={10} style={{ display: 'inline', marginRight: '4px' }} />
                  Google AI Studio key is automatically active.
                </div>
              )}
            </div>
            <div className="field">
              <label>Groq API Key</label>
              <input className="inp" type="password" placeholder="Enter Groq Key" value={config.groqKey} onChange={(e) => setConfig({ ...config, groqKey: e.target.value })} />
            </div>
            <div className="field">
              <label>Claude API Key</label>
              <input className="inp" type="password" placeholder="Enter Claude Key" value={config.claudeKey} onChange={(e) => setConfig({ ...config, claudeKey: e.target.value })} />
            </div>
            <div className="field">
              <label>OpenAI API Key</label>
              <input className="inp" type="password" placeholder="Enter OpenAI Key" value={config.openaiKey} onChange={(e) => setConfig({ ...config, openaiKey: e.target.value })} />
            </div>
            <div className="field">
              <label>ElevenLabs Key</label>
              <input className="inp" type="password" placeholder="Enter ElevenLabs Key" value={config.elevenLabsKey} onChange={(e) => setConfig({ ...config, elevenLabsKey: e.target.value })} />
            </div>
            <div className="field">
              <label>Murf.ai Key</label>
              <input className="inp" type="password" placeholder="Enter Murf Key" value={config.murfKey} onChange={(e) => setConfig({ ...config, murfKey: e.target.value })} />
            </div>
            <div className="field">
              <label>Audixa.ai Key</label>
              <input className="inp" type="password" placeholder="Enter Audixa Key" value={config.audixaKey} onChange={(e) => setConfig({ ...config, audixaKey: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Host Personalities */}
        <div className={`acc-item ${openSettings === 'hosts' ? 'open' : ''}`}>
          <div className="acc-head" onClick={() => setOpenSettings(openSettings === 'hosts' ? null : 'hosts')}>
            <div className="ctw">
              <div className="cicon icon-purple"><Mic size={14} /></div>
              <div>
                <div className="ctitle">Host Personalities</div>
                <div className="csub">Voices & Names</div>
              </div>
            </div>
            <ChevronDown className="acc-chevron" size={16} />
          </div>
          <div className="acc-content">
            <div className="field">
              <label>Number of Hosts</label>
              <select className="inp" value={config.numHosts} onChange={(e) => setConfig({ ...config, numHosts: parseInt(e.target.value) })}>
                <option value={1}>1 Host (Solo Brief)</option>
                <option value={2}>2 Hosts (Conversation)</option>
                <option value={3}>3 Hosts (Panel Discussion)</option>
              </select>
            </div>
            {[...Array(config.numHosts)].map((_, i) => (
              <div key={i} className="host-config-card">
                <div style={{ fontWeight: 700, fontSize: '12px', marginBottom: '8px', color: 'var(--amber)' }}>Host {i + 1}</div>
                <div className="field">
                  <label>Name</label>
                  <input className="inp" type="text" value={config.hosts[i].name} onChange={(e) => {
                    const newHosts = [...config.hosts];
                    newHosts[i].name = e.target.value;
                    setConfig({ ...config, hosts: newHosts });
                  }} />
                </div>
                
                {config.voiceGeneratorProvider === 'gemini-tts' && (
                  <div className="field">
                    <label>Gemini Voice</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <select className="inp" style={{ flex: 1 }} value={config.hosts[i].geminiVoice} onChange={(e) => {
                        const newHosts = [...config.hosts];
                        newHosts[i].geminiVoice = e.target.value;
                        setConfig({ ...config, hosts: newHosts });
                      }}>
                        {VOICES.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                      <button className={`btn btn-ghost btn-sm ${isPlayingSample === config.hosts[i].geminiVoice ? 'playing' : ''}`} onClick={() => playVoiceSample(config.hosts[i].geminiVoice)}>
                        <Volume2 size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {config.voiceGeneratorProvider === 'elevenlabs' && (
                  <div className="field">
                    <label>ElevenLabs Voice ID</label>
                    <input className="inp" type="text" placeholder="Enter Voice ID" value={config.hosts[i].elevenLabsVoice} onChange={(e) => {
                      const newHosts = [...config.hosts];
                      newHosts[i].elevenLabsVoice = e.target.value;
                      setConfig({ ...config, hosts: newHosts });
                    }} />
                  </div>
                )}

                {config.voiceGeneratorProvider === 'murf' && (
                  <div className="field">
                    <label>Murf Voice ID</label>
                    <input className="inp" type="text" placeholder="Enter Voice ID" value={config.hosts[i].murfVoice} onChange={(e) => {
                      const newHosts = [...config.hosts];
                      newHosts[i].murfVoice = e.target.value;
                      setConfig({ ...config, hosts: newHosts });
                    }} />
                  </div>
                )}

                {config.voiceGeneratorProvider === 'audixa' && (
                  <div className="field">
                    <label>Audixa Voice ID</label>
                    <input className="inp" type="text" placeholder="Enter Voice ID" value={config.hosts[i].audixaVoice} onChange={(e) => {
                      const newHosts = [...config.hosts];
                      newHosts[i].audixaVoice = e.target.value;
                      setConfig({ ...config, hosts: newHosts });
                    }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Personalization */}
        <div className={`acc-item ${openSettings === 'personalization' ? 'open' : ''}`}>
          <div className="acc-head" onClick={() => setOpenSettings(openSettings === 'personalization' ? null : 'personalization')}>
            <div className="ctw">
              <div className="cicon icon-teal"><User size={14} /></div>
              <div>
                <div className="ctitle">Personalization</div>
                <div className="csub">Intro & Greeting</div>
              </div>
            </div>
            <ChevronDown className="acc-chevron" size={16} />
          </div>
          <div className="acc-content">
            <div className="field">
              <label>User Name</label>
              <input 
                className="inp" 
                type="text" 
                placeholder="Enter your name" 
                value={config.userName} 
                onChange={(e) => setConfig({ ...config, userName: e.target.value })} 
              />
              <div className="phi">Used in greetings (e.g., [name])</div>
            </div>
            <div className="field">
              <label>Podcast Pretext (Introduction)</label>
              <textarea 
                className="inp" 
                style={{ minHeight: '80px', resize: 'vertical' }}
                placeholder="Enter podcast introduction..." 
                value={config.pretext} 
                onChange={(e) => setConfig({ ...config, pretext: e.target.value })} 
              />
              <div className="phi">
                This text will be added at the start of the script. Use <code>[name]</code> to insert your name.
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Integration */}
        <div className={`acc-item ${openSettings === 'whatsapp' ? 'open' : ''}`}>
          <div className="acc-head" onClick={() => setOpenSettings(openSettings === 'whatsapp' ? null : 'whatsapp')}>
            <div className="ctw">
              <div className="cicon" style={{ color: '#25D366' }}><Smartphone size={14} /></div>
              <div>
                <div className="ctitle">WhatsApp Integration</div>
                <div className="csub">News sharing settings</div>
              </div>
            </div>
            <ChevronDown className="acc-chevron" size={16} />
          </div>
          <div className="acc-content">
            <div className="field" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <label>Enable WhatsApp Feature</label>
              <label className="toggle">
                <input 
                  type="checkbox" 
                  checked={config.whatsappEnabled} 
                  onChange={() => setConfig(prev => ({ ...prev, whatsappEnabled: !prev.whatsappEnabled }))} 
                />
                <div className="ttrack"><div className="tthumb" /></div>
              </label>
            </div>
            {config.whatsappEnabled && (
              <>
                <div className="field">
                  <label>Sending Method</label>
                  <select 
                    className="inp" 
                    value={config.whatsappMethod} 
                    onChange={(e) => setConfig({ ...config, whatsappMethod: e.target.value as any })}
                  >
                    <option value="link">Direct Link (wa.me)</option>
                    <option value="webhook">Background Webhook (Automation)</option>
                    <option value="callmebot">CallMeBot (Send to Self)</option>
                  </select>
                  <div className="phi">
                    {config.whatsappMethod === 'link' && 'Opens WhatsApp in a new tab with the message pre-filled.'}
                    {config.whatsappMethod === 'webhook' && 'Sends message in background to a webhook URL (e.g. MacroDroid/Tasker).'}
                    {config.whatsappMethod === 'callmebot' && 'Sends message to your phone via CallMeBot API (Free & Background).'}
                  </div>
                </div>

                {config.whatsappMethod === 'webhook' && (
                  <div className="field">
                    <label>Webhook URL</label>
                    <input 
                      className="inp" 
                      type="text" 
                      placeholder="https://your-webhook-url.com" 
                      value={config.whatsappWebhookUrl} 
                      onChange={(e) => setConfig({ ...config, whatsappWebhookUrl: e.target.value })} 
                    />
                    <div className="phi">The URL that will receive the POST request with the message.</div>
                  </div>
                )}

                {config.whatsappMethod === 'callmebot' && (
                  <div className="field">
                    <label>CallMeBot API Key</label>
                    <input 
                      className="inp" 
                      type="text" 
                      placeholder="Enter your API Key" 
                      value={config.whatsappApiKey} 
                      onChange={(e) => setConfig({ ...config, whatsappApiKey: e.target.value })} 
                    />
                    <div className="phi">Get your key from @CallMeBot_WhatsApp on Telegram/WhatsApp.</div>
                  </div>
                )}

                <div className="field">
                  <label>My WhatsApp Number</label>
                  <input 
                    className="inp" 
                    type="text" 
                    placeholder="e.g. +919876543210" 
                    value={config.whatsappNumber} 
                    onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })} 
                  />
                  <div className="phi">Include country code (e.g. +91). This is where the news will be sent.</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <button className="btn btn-teal" style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => handleSave('settings')}>
        {saveStatus.tab === 'settings' && saveStatus.show ? <Check size={18} /> : <Save size={18} />}
        {saveStatus.tab === 'settings' && saveStatus.show ? 'Settings Saved' : 'Save Settings'}
      </button>
    </div>
  );
};
