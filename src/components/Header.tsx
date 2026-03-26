import React from 'react';
import { Mic, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  return (
    <div className="header">
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="logo-wrap">
        <div className="logo"><Mic size={24} color="white" /></div>
        <div className="logo-ping"></div>
      </div>
      <h1>Pulse <span className="accent">Studio</span></h1>
      <p className="tagline">Your personal AI-powered podcast studio</p>
    </div>
  );
};
