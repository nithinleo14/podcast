import React from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  isDark,
  setIsDark
}) => {
  return (
    <div className={`app-container ${isDark ? 'dark' : ''}`}>
      <div className="app-shell">
        <Header isDark={isDark} setIsDark={setIsDark} />
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="app-main">
          {children}
        </main>
      </div>
    </div>
  );
};
