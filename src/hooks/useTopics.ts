import { useState, useEffect } from 'react';
import { Topic } from '../types';
import { DEFAULT_TOPICS } from '../constants';

export function useTopics() {
  const [topics, setTopics] = useState<Topic[]>(() => {
    const saved = localStorage.getItem('dp_topics');
    if (!saved) return DEFAULT_TOPICS;
    try {
      return JSON.parse(saved);
    } catch {
      return DEFAULT_TOPICS;
    }
  });

  useEffect(() => {
    localStorage.setItem('dp_topics', JSON.stringify(topics));
  }, [topics]);

  return [topics, setTopics] as const;
}
