import React, { useState } from 'react';
import { List, Plus, Trash2, GripVertical, CheckCircle, ArrowRight, Save } from 'lucide-react';
import { Reorder, useDragControls } from 'motion/react';
import { Topic } from '../types';

interface TopicItemProps {
  topic: Topic;
  index: number;
  topics: Topic[];
  setTopics: (t: Topic[]) => void;
  pctMode: boolean;
}

function TopicItem({ topic, index, topics, setTopics, pctMode }: TopicItemProps) {
  const dragControls = useDragControls();
  return (
    <Reorder.Item 
      key={topic.id} 
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

interface TopicsPanelProps {
  topics: Topic[];
  setTopics: (t: Topic[]) => void;
  pctMode: boolean;
  setPctMode: (m: boolean) => void;
  handleSave: (tab: string) => void;
  saveStatus: { tab: string; show: boolean };
  resetTopics: () => void;
  addTopic: (emoji: string, text: string) => void;
}

export const TopicsPanel: React.FC<TopicsPanelProps> = ({
  topics,
  setTopics,
  pctMode,
  setPctMode,
  handleSave,
  saveStatus,
  resetTopics,
  addTopic
}) => {
  const [newEmoji, setNewEmoji] = useState('📌');
  const [newText, setNewText] = useState('');

  const totalPct = topics.filter(t => t.enabled).reduce((acc, t) => acc + t.percentage, 0);

  return (
    <div className="panel show">
      <div className="card">
        <div className="card-head">
          <div className="ctw">
            <div className="cicon icon-teal"><List size={14} /></div>
            <div>
              <div className="ctitle">Podcast Topics</div>
              <div className="csub">Manage news sources</div>
            </div>
          </div>
          <div className="toggle">
            <input type="checkbox" id="pct" checked={pctMode} onChange={(e) => setPctMode(e.target.checked)} />
            <label htmlFor="pct" className="ttrack"><div className="tthumb"></div></label>
          </div>
        </div>

        {pctMode && (
          <div className="pct-tot">
            <span>Total Weightage:</span>
            <span className={`ptv ${totalPct === 100 ? 'ok' : 'warn'}`}>{totalPct}%</span>
          </div>
        )}

        <Reorder.Group axis="y" values={topics} onReorder={setTopics} className="topics-list">
          {topics.map((t, i) => (
            <TopicItem key={t.id} topic={t} index={i} topics={topics} setTopics={setTopics} pctMode={pctMode} />
          ))}
        </Reorder.Group>

        <div className="add-row">
          <input className="inp ie" type="text" value={newEmoji} onChange={(e) => setNewEmoji(e.target.value)} placeholder="Emoji" />
          <input className="inp it" type="text" value={newText} onChange={(e) => setNewText(e.target.value)} placeholder="Add custom topic..." 
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addTopic(newEmoji, newText);
                setNewText('');
              }
            }} />
          <button className="btn btn-amber btn-sm" onClick={() => { addTopic(newEmoji, newText); setNewText(''); }}>
            <Plus size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button className="btn btn-amber" style={{ flex: 1 }} onClick={() => handleSave('topics')}>
            {saveStatus.tab === 'topics' && saveStatus.show ? <CheckCircle size={18} /> : <Save size={18} />}
            {saveStatus.tab === 'topics' && saveStatus.show ? 'Changes Saved!' : 'Save Topic Changes'}
          </button>
          <button className="btn btn-outline" style={{ width: 'auto', marginBottom: 0 }} onClick={resetTopics}>
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
