import React from 'react';
import { Play, List, Settings, Zap } from 'lucide-react';

interface NavigationProps {
  activeTab: 'generate' | 'topics' | 'settings' | 'guide';
  setActiveTab: (tab: 'generate' | 'topics' | 'settings' | 'guide') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="nav">
      <button
        type="button"
        className={`nav-tab ${activeTab === 'generate' ? 'active' : ''}`}
        aria-current={activeTab === 'generate' ? 'page' : undefined}
        onClick={() => setActiveTab('generate')}
      >
        <Play
          className="ni"
          color={activeTab === 'generate' ? 'var(--amber)' : '#3b82f6'}
          aria-hidden="true"
          focusable="false"
        />
        <span>Generate</span>
      </button>

      <button
        type="button"
        className={`nav-tab ${activeTab === 'topics' ? 'active' : ''}`}
        aria-current={activeTab === 'topics' ? 'page' : undefined}
        onClick={() => setActiveTab('topics')}
      >
        <List
          className="ni"
          color={activeTab === 'topics' ? 'var(--amber)' : '#14b8a6'}
          aria-hidden="true"
          focusable="false"
        />
        <span>Topics</span>
      </button>

      <button
        type="button"
        className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
        aria-current={activeTab === 'settings' ? 'page' : undefined}
        onClick={() => setActiveTab('settings')}
      >
        <Settings
          className="ni"
          color={activeTab === 'settings' ? 'var(--amber)' : '#a78bfa'}
          aria-hidden="true"
          focusable="false"
        />
        <span>Settings</span>
      </button>

      <button
        type="button"
        className={`nav-tab ${activeTab === 'guide' ? 'active' : ''}`}
        aria-current={activeTab === 'guide' ? 'page' : undefined}
        onClick={() => setActiveTab('guide')}
      >
        <Zap
          className="ni"
          color={activeTab === 'guide' ? 'var(--amber)' : '#f59e0b'}
          aria-hidden="true"
          focusable="false"
        />
        <span>Automate</span>
      </button>
    </div>
  );
};
