import { Search, PenTool, Volume2 } from 'lucide-react';

interface AgentStatusProps {
  agentStates: { news: string; script: string; voice: string };
  agentMsgs: { news: string; script: string; voice: string };
}

export function AgentStatus({ agentStates, agentMsgs }: AgentStatusProps) {
  return (
    <div className="agents">
      <div className="agent">
        <div className="aico icon-blue"><Search size={14} /></div>
        <div className="abody">
          <div className="aname">News Fetcher</div>
          <div className="ast">{agentMsgs.news}</div>
        </div>
        <div className={`dot ${agentStates.news}`}></div>
      </div>
      <div className="agent">
        <div className="aico icon-purple"><PenTool size={14} /></div>
        <div className="abody">
          <div className="aname">Script Writer</div>
          <div className="ast">{agentMsgs.script}</div>
        </div>
        <div className={`dot ${agentStates.script}`}></div>
      </div>
      <div className="agent">
        <div className="aico icon-teal"><Volume2 size={14} /></div>
        <div className="abody">
          <div className="aname">Voice Generator</div>
          <div className="ast">{agentMsgs.voice}</div>
        </div>
        <div className={`dot ${agentStates.voice}`}></div>
      </div>
    </div>
  );
}
