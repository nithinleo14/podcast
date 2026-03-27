import React, { useRef, useEffect } from 'react';
import { 
  Clock, 
  Smartphone, 
  Copy, 
  Send, 
  ChevronDown, 
  Download, 
  Zap, 
  FileText, 
  Volume2, 
  Search, 
  PenTool, 
  Mic,
  Play 
} from 'lucide-react';
import { PodcastConfig } from '../types';

interface GeneratePanelProps {
  config: PodcastConfig;
  setConfig: (c: PodcastConfig) => void;
  isGenerating: boolean;
  handleGenerate: () => void;
  agentStates: { news: string; script: string; voice: string };
  agentMsgs: { news: string; script: string; voice: string };
  logs: { msg: string; cls?: string }[];
  script: string;
  whatsappMessage: string;
  audioUrl: string;
  audioMeta: string;
  handleCopyWhatsapp: () => void;
  handleSendWhatsapp: () => void;
  downloadAudio: () => void;
}

export const GeneratePanel: React.FC<GeneratePanelProps> = ({
  config,
  setConfig,
  isGenerating,
  handleGenerate,
  agentStates,
  agentMsgs,
  logs,
  script,
  whatsappMessage,
  audioUrl,
  audioMeta,
  handleCopyWhatsapp,
  handleSendWhatsapp,
  downloadAudio
}) => {
  const logboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logboxRef.current) {
      logboxRef.current.scrollTop = logboxRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="panel show">
      <div className="card">
        <div className="card-head">
          <div className="ctw">
            <div className="cicon icon-amber"><Clock size={14} /></div>
            <div>
              <div className="ctitle">Podcast Duration</div>
              <div className="csub">Set target length</div>
            </div>
          </div>
        </div>
        <div className="dur-display">
          <span className="dur-num">{config.duration}</span>
          <span className="dur-unit">minutes</span>
        </div>
        <div className="range-container">
          <div className="range-lines">
            {[...Array(11)].map((_, i) => <div key={i} className="range-line" />)}
          </div>
          <input 
            type="range" 
            min="1" 
            max="30" 
            value={config.duration} 
            onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })} 
          />
          <div className="range-marks">
            <span>1m</span>
            <span>15m</span>
            <span>30m</span>
          </div>
        </div>
        <button 
          className="btn btn-amber" 
          onClick={handleGenerate} 
          disabled={isGenerating}
          style={{ marginTop: '10px' }}
        >
          {isGenerating ? (
            <>
              <div className="logo-ping" style={{ width: '16px', height: '16px' }}></div>
              Generating...
            </>
          ) : (
            <>
              <Zap size={18} fill="currentColor" />
              Generate Podcast
            </>
          )}
        </button>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="ctw">
            <div className="cicon icon-teal"><Mic size={14} /></div>
            <div className="ctitle">Studio Agents</div>
          </div>
        </div>
        <div className="agents">
          <div className="agent">
            <div className="aico icon-blue"><Search size={16} /></div>
            <div className="abody">
              <div className="aname">News Researcher</div>
              <div className="ast">{agentMsgs.news}</div>
            </div>
            <div className={`dot ${agentStates.news}`}></div>
          </div>
          <div className="agent">
            <div className="aico icon-purple"><PenTool size={16} /></div>
            <div className="abody">
              <div className="aname">Script Writer</div>
              <div className="ast">{agentMsgs.script}</div>
            </div>
            <div className={`dot ${agentStates.script}`}></div>
          </div>
          <div className="agent">
            <div className="aico icon-teal"><Volume2 size={16} /></div>
            <div className="abody">
              <div className="aname">Voice Generator</div>
              <div className="ast">{agentMsgs.voice}</div>
            </div>
            <div className={`dot ${agentStates.voice}`}></div>
          </div>
        </div>

        <div className="logbox" ref={logboxRef}>
          {logs.length === 0 ? (
            <div style={{ opacity: 0.4 }}>Studio logs will appear here...</div>
          ) : (
            logs.map((l, i) => <div key={i} className={l.cls}>{l.msg}</div>)
          )}
        </div>
      </div>

      {audioUrl && (
        <div className="card" style={{ border: '1px solid var(--teal)', background: 'var(--teal-dim)' }}>
          <div className="card-head">
            <div className="ctw">
              <div className="cicon icon-teal"><Play size={14} /></div>
              <div>
                <div className="ctitle">Your Podcast is Ready</div>
                <div className="csub">{audioMeta}</div>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={downloadAudio}>
              <Download size={14} />
            </button>
          </div>
          <audio controls src={audioUrl}></audio>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-teal" style={{ flex: 1, marginBottom: 0 }} onClick={downloadAudio}>
              <Download size={16} /> Download MP3
            </button>
            {config.whatsappEnabled && whatsappMessage && (
              <button className="btn btn-ghost" style={{ flex: 1, border: '1px solid var(--teal)', color: 'var(--teal)' }} onClick={handleSendWhatsapp}>
                <Smartphone size={16} /> {config.whatsappMethod === 'webhook' ? 'Send Webhook' : config.whatsappMethod === 'callmebot' ? 'Send to Me' : 'Send WhatsApp'}
              </button>
            )}
          </div>
        </div>
      )}

      {script && (
        <div className="card">
          <div className="card-head">
            <div className="ctw">
              <div className="cicon icon-purple"><FileText size={14} /></div>
              <div className="ctitle">Production Script</div>
            </div>
          </div>
          <div className="script-box">
            {script.split('\n').map((line, i) => {
              if (line.includes(':')) {
                const [name, text] = line.split(':');
                const hostIdx = config.hosts.findIndex(h => h.name.toLowerCase() === name.trim().toLowerCase());
                const cls = hostIdx === 0 ? 'sh1' : hostIdx === 1 ? 'sh2' : hostIdx === 2 ? 'sh3' : '';
                return <p key={i}><span className={cls}>{name}:</span> {text}</p>;
              }
              return <p key={i}>{line}</p>;
            })}
          </div>
        </div>
      )}

      {whatsappMessage && (
        <div className="card">
          <div className="card-head">
            <div className="ctw">
              <div className="cicon icon-blue"><Smartphone size={14} /></div>
              <div className="ctitle">WhatsApp Summary</div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button className="btn btn-ghost btn-sm" onClick={handleCopyWhatsapp} title="Copy to Clipboard">
                <Copy size={14} />
              </button>
              <button className="btn btn-ghost btn-sm" onClick={handleSendWhatsapp} title={config.whatsappMethod === 'webhook' ? 'Send via Webhook' : config.whatsappMethod === 'callmebot' ? 'Send to My Phone' : 'Open in WhatsApp'}>
                <Send size={14} />
              </button>
            </div>
          </div>
          <div className="script-box" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
            {whatsappMessage}
          </div>
        </div>
      )}
    </div>
  );
};
