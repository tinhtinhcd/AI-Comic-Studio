import React from 'react';
import { Agent, AgentRole } from '../types';
import { AGENTS } from '../constants';
import { Users, BookOpen, PenTool, Layout, Palette, Megaphone, Mic, Video, Globe, TrendingUp, ShieldAlert, Archive } from 'lucide-react';

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
      case AgentRole.ARCHIVIST: return <Archive className="w-5 h-5" />;
      default: return <PenTool className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-20 lg:w-72 bg-zinc-950 border-r border-zinc-900 flex flex-col h-full flex-shrink-0 transition-all duration-300 shadow-2xl z-10">
      <div className="p-6 border-b border-zinc-900 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 shadow-lg shadow-indigo-500/20 flex items-center justify-center shrink-0">
          <PenTool className="text-white w-5 h-5" />
        </div>
        <div className="hidden lg:block overflow-hidden">
          <h1 className="font-bold text-base text-zinc-100 truncate tracking-tight">Motion Studio AI</h1>
          <p className="text-xs text-zinc-500 truncate">{projectTitle || "New Project"}</p>
        </div>
      </div>

      <div className="flex-1 py-6 space-y-1 overflow-y-auto px-3 custom-scrollbar">
        <p className="hidden lg:block text-[10px] font-bold uppercase text-zinc-600 px-4 mb-2 tracking-widest">Agents</p>
        {Object.values(AGENTS).map((agent) => {
            const isActive = currentRole === agent.id;
            return (
                <button
                key={agent.id}
                onClick={() => onSelectRole(agent.id)}
                className={`w-full px-3 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 group relative overflow-hidden
                    ${isActive ? 'bg-zinc-900 text-white shadow-inner' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50'}
                `}
                >
                {isActive && <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-500 rounded-r-full" />}
                <div className={`shrink-0 transition-colors ${isActive ? 'text-indigo-400' : 'group-hover:text-zinc-300'}`}>
                    {getIcon(agent.id)}
                </div>
                <div className="hidden lg:block text-left">
                    <div className="text-sm font-medium">{agent.name}</div>
                    <div className="text-[10px] opacity-60 truncate font-medium">{agent.description.split('.')[0]}</div>
                </div>
                </button>
            );
        })}
      </div>

      <div className="p-4 border-t border-zinc-900 bg-zinc-950">
         <div className="bg-zinc-900/50 rounded-xl p-4 hidden lg:block border border-zinc-900">
            <div className="flex justify-between items-center mb-2">
                <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Storage</p>
                <span className="text-[10px] text-zinc-400">75%</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full w-3/4"></div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Sidebar;
