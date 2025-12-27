import React from 'react';
import { Agent, AgentRole } from '../types';
import { AGENTS } from '../constants';
import { Users, BookOpen, PenTool, Layout, Palette, Megaphone, Mic, Video, Globe, TrendingUp, ShieldAlert } from 'lucide-react';

interface SidebarProps {
  currentRole: AgentRole;
  onSelectRole: (role: AgentRole) => void;
  projectTitle: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentRole, onSelectRole, projectTitle }) => {
  
  const getIcon = (role: AgentRole) => {
    switch (role) {
      case AgentRole.PROJECT_MANAGER: return <Layout className="w-5 h-5" />;
      case AgentRole.MARKET_RESEARCHER: return <TrendingUp className="w-5 h-5" />;
      case AgentRole.SCRIPTWRITER: return <BookOpen className="w-5 h-5" />;
      case AgentRole.CENSOR: return <ShieldAlert className="w-5 h-5" />;
      case AgentRole.TRANSLATOR: return <Globe className="w-5 h-5" />;
      case AgentRole.CHARACTER_DESIGNER: return <Users className="w-5 h-5" />;
      case AgentRole.PANEL_ARTIST: return <Palette className="w-5 h-5" />;
      case AgentRole.CINEMATOGRAPHER: return <Video className="w-5 h-5" />;
      case AgentRole.VOICE_ACTOR: return <Mic className="w-5 h-5" />;
      case AgentRole.PUBLISHER: return <Megaphone className="w-5 h-5" />;
      default: return <PenTool className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-20 lg:w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full flex-shrink-0 transition-all duration-300">
      <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
          <PenTool className="text-white w-5 h-5" />
        </div>
        <div className="hidden lg:block overflow-hidden">
          <h1 className="font-bold text-sm text-zinc-100 truncate">Motion Studio</h1>
          <p className="text-xs text-zinc-500 truncate">{projectTitle}</p>
        </div>
      </div>

      <div className="flex-1 py-4 space-y-1 overflow-y-auto">
        {Object.values(AGENTS).map((agent) => {
            const isActive = currentRole === agent.id;
            return (
                <button
                key={agent.id}
                onClick={() => onSelectRole(agent.id)}
                className={`w-full px-4 py-3 flex items-center gap-3 transition-colors relative
                    ${isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}
                `}
                >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />}
                <div className="shrink-0">
                    {getIcon(agent.id)}
                </div>
                <div className="hidden lg:block text-left">
                    <div className="text-sm font-medium">{agent.name}</div>
                    <div className="text-xs opacity-60 truncate">{agent.description.split('.')[0]}</div>
                </div>
                </button>
            );
        })}
      </div>

      <div className="p-4 border-t border-zinc-800">
         <div className="bg-zinc-800 rounded-lg p-3 hidden lg:block">
            <p className="text-xs text-zinc-400 mb-1">Production Status</p>
            <div className="w-full bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-2/3"></div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Sidebar;
