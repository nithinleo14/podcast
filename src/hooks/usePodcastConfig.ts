import { useState, useEffect } from 'react';
import { PodcastConfig } from '../types';
import { DEFAULT_CONFIG } from '../constants';

export function usePodcastConfig() {
  const [config, setConfig] = useState<PodcastConfig>(() => {
    const saved = localStorage.getItem('dp_config');
    if (!saved) return DEFAULT_CONFIG;
    try {
      return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  useEffect(() => {
    localStorage.setItem('dp_config', JSON.stringify(config));
  }, [config]);

  return [config, setConfig] as const;
}
