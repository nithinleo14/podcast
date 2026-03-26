import React from 'react';
import { Play, List, Settings, Zap } from 'lucide-react';

interface NavigationProps {
  activeTab: 'generate' | 'topics' | 'settings' | 'guide';
  setActiveTab: (tab: 'generate' | 'topics' | 'settings' | 'guide') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="nav">
      <div className={`nav-tab ${activeTab === 'generate' ? 'active' : ''}`} onClick={() => setActiveTab('generate')}>
        <Play className="ni" color={activeTab === 'generate' ? 'var(--amber)' : '#3b82f6'} />
        <span>Generate</span>
      </div>
      <div className={`nav-tab ${activeTab === 'topics' ? 'active' : ''}`} onClick={() => setActiveTab('topics')}>
        <List className="ni" color={activeTab === 'topics' ? 'var(--amber)' : '#14b8a6'} />
        <span>Topics</span>
      </div>
      <div className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
        <Settings className="ni" color={activeTab === 'settings' ? 'var(--amber)' : '#a78bfa'} />
        <span>Settings</span>
      </div>
      <div className={`nav-tab ${activeTab === 'guide' ? 'active' : ''}`} onClick={() => setActiveTab('guide')}>
        <Zap className="ni" color={activeTab === 'guide' ? 'var(--amber)' : '#f59e0b'} />
        <span>Automate</span>
      </div>
    </div>
  );
};
