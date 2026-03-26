import { Save } from 'lucide-react';
import { CustomProvider, PodcastConfig } from '../lib/podcastService';

interface CustomProviderModalProps {
  editingCustom: CustomProvider;
  setEditingCustom: (provider: CustomProvider | null) => void;
  config: PodcastConfig;
  setConfig: (config: PodcastConfig) => void;
  testStatus: { loading: boolean; error: string; success: string } | null;
  handleTestConnection: () => void;
  notify: (msg: string, type: 'success' | 'error') => void;
}

export function CustomProviderModal({
  editingCustom,
  setEditingCustom,
  config,
  setConfig,
  testStatus,
  handleTestConnection,
  notify
}: CustomProviderModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-head">
          <div className="ctitle">{editingCustom.name ? 'Edit' : 'Add'} Custom Provider</div>
          <button className="btn-ghost btn-sm" onClick={() => setEditingCustom(null)}>✕</button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Provider Name</label>
            <input className="inp" type="text" placeholder="e.g. My Local LLM" value={editingCustom.name} onChange={(e) => setEditingCustom({ ...editingCustom, name: e.target.value })} />
          </div>
          <div className="field">
            <label>Type</label>
            <select className="inp" value={editingCustom.type} onChange={(e) => setEditingCustom({ ...editingCustom, type: e.target.value as 'llm' | 'tts' })}>
              <option value="llm">LLM (Text Generation)</option>
              <option value="tts">TTS (Speech Generation)</option>
            </select>
          </div>
          <div className="field">
            <label>Endpoint URL</label>
            <input className="inp" type="text" placeholder="https://api.example.com/v1/chat" value={editingCustom.url} onChange={(e) => setEditingCustom({ ...editingCustom, url: e.target.value })} />
          </div>
          <div className="field">
            <label>API Key (Optional)</label>
            <input className="inp" type="password" placeholder="sk-..." value={editingCustom.apiKey} onChange={(e) => setEditingCustom({ ...editingCustom, apiKey: e.target.value })} />
          </div>
          <div className="field">
            <label>Auth Header / Prefix</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input className="inp" style={{ flex: 1 }} type="text" placeholder="Authorization" value={editingCustom.authHeader} onChange={(e) => setEditingCustom({ ...editingCustom, authHeader: e.target.value })} />
              <input className="inp" style={{ flex: 1 }} type="text" placeholder="Bearer " value={editingCustom.authPrefix} onChange={(e) => setEditingCustom({ ...editingCustom, authPrefix: e.target.value })} />
            </div>
          </div>
          <div className="field">
            <label>Payload Template (JSON)</label>
            <div className="phi" style={{ marginBottom: '4px' }}>Use <code>{editingCustom.type === 'llm' ? '{{prompt}}' : '{{text}}'}</code> as placeholder.</div>
            <textarea className="inp" style={{ minHeight: '100px', fontFamily: 'var(--mono)', fontSize: '11px' }} value={editingCustom.payloadTemplate} onChange={(e) => setEditingCustom({ ...editingCustom, payloadTemplate: e.target.value })} />
          </div>
          <div className="field">
            <label>Response Path (JSONPath-like)</label>
            <input className="inp" type="text" placeholder="choices[0].message.content" value={editingCustom.responsePath} onChange={(e) => setEditingCustom({ ...editingCustom, responsePath: e.target.value })} />
          </div>
          
          {testStatus && (
            <div className={`notice ${testStatus.error ? 'error' : testStatus.success ? 'success' : ''}`} style={{ marginTop: '10px' }}>
              {testStatus.loading ? '⏳ Testing...' : testStatus.error ? `❌ ${testStatus.error}` : `✅ ${testStatus.success}`}
            </div>
          )}
        </div>
        <div className="modal-foot" style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" style={{ flex: 1, marginBottom: 0 }} onClick={() => handleTestConnection()}>Test</button>
          <button className="btn btn-amber" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => {
            const exists = config.customProviders.find(p => p.id === editingCustom.id);
            if (exists) {
              setConfig({ ...config, customProviders: config.customProviders.map(p => p.id === editingCustom.id ? editingCustom : p) });
            } else {
              setConfig({ ...config, customProviders: [...config.customProviders, editingCustom] });
            }
            setEditingCustom(null);
            notify('Provider Saved', 'success');
          }}><Save size={16} /> Save Provider</button>
        </div>
      </div>
    </div>
  );
}
