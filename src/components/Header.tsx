import React from 'react';
import { Mic, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ isDark, setIsDark }) => {
  return (
    <div className="header">
      <button
        type="button"
        className="theme-toggle"
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        onClick={() => setIsDark(!isDark)}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="logo-wrap">
        <div className="logo"><Mic size={24} color="white" /></div>
        <div className="logo-ping"></div>
      </div>
      <div className="header-text">
        <h1>Pulse <span className="accent">Studio</span></h1>
        <p className="tagline">Your personal AI-powered podcast studio</p>
      </div>
    </div>
  );
};
