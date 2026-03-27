import React from 'react';
import { Reorder, useDragControls } from 'motion/react';
import { GripVertical, Trash2, CheckCircle } from 'lucide-react';
import { Topic } from '../types';

export interface TopicItemProps {
  topic: Topic;
  index: number;
  topics: Topic[];
  setTopics: (t: Topic[]) => void;
  pctMode: boolean;
}

export const TopicItem: React.FC<TopicItemProps> = ({ topic, index, topics, setTopics, pctMode }) => {
  const dragControls = useDragControls();
  return (
    <Reorder.Item 
      value={topic} 
      dragListener={false}
      dragControls={dragControls}
      className={`ti ${topic.enabled ? 'on' : ''}`}
    >
      <div className="ti-main">
        <div 
          className="dh" 
          onPointerDown={(e) => dragControls.start(e)}
          style={{ touchAction: 'none' }}
        >
          <GripVertical size={16} />
        </div>
        <div className="te">{topic.emoji}</div>
        <div className={`tn ${topic.enabled ? '' : 'dim'}`}>{topic.text}</div>
        <div className="tchk" onClick={(e) => {
          e.stopPropagation();
          const newTopics = [...topics];
          newTopics[index].enabled = !newTopics[index].enabled;
          setTopics(newTopics);
        }}>{topic.enabled ? <CheckCircle size={12} /> : ''}</div>
        <button className="tdel" onClick={(e) => {
          e.stopPropagation();
          setTopics(topics.filter(t => t.id !== topic.id));
        }}><Trash2 size={14} /></button>
      </div>
      {pctMode && topic.enabled && (
        <div className="tpr show">
          <input type="range" style={{ flex: 1 }} min="0" max="100" value={topic.percentage} 
            onPointerDown={(e) => e.stopPropagation()}
            onChange={(e) => {
              const newTopics = [...topics];
              newTopics[index].percentage = parseInt(e.target.value);
              setTopics(newTopics);
            }} />
          <div className="plbl">{topic.percentage}%</div>
        </div>
      )}
    </Reorder.Item>
  );
}
