
import React from 'react';
import { Agent, AgentRole } from '../types';
import { AGENTS, TRANSLATIONS } from '../constants';
import { Users, BookOpen, PenTool, Layout, Palette, Megaphone, Mic, Video, Globe, TrendingUp, ShieldAlert, Archive, Briefcase, ChevronRight } from 'lucide-react';

interface SidebarProps {
  currentRole: AgentRole;
  onSelectRole: (role: AgentRole) => void;
  projectTitle: string;
  uiLanguage: 'en' | 'vi';
  setUiLanguage: (lang: 'en' | 'vi') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentRole, onSelectRole, projectTitle, uiLanguage, setUiLanguage }) => {
  const t = (key: string) => (TRANSLATIONS[uiLanguage] as any)[key] || key;
  
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

  // Group Agents by Department
  const departments: Record<string, Agent[]> = {};
  Object.values(AGENTS).forEach(agent => {
    const deptKey = agent.department; 
    if (!departments[deptKey]) {
      departments[deptKey] = [];
    }
    departments[deptKey].push(agent);
  });

  const deptOrder = ['dept.strategy', "dept.writers", 'dept.visuals', 'dept.production'];

  return (
    <div className="w-20 lg:w-72 bg-white border-r border-slate-200 flex flex-col h-full flex-shrink-0 transition-all duration-300 shadow-xl shadow-slate-200/50 z-20">
      <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 shadow-md shadow-indigo-500/20 flex items-center justify-center shrink-0">
          <Briefcase className="text-white w-5 h-5" />
        </div>
        <div className="hidden lg:block overflow-hidden">
          <h1 className="font-bold text-base text-slate-900 truncate tracking-tight">{t('app.title')}</h1>
          <p className="text-xs text-slate-500 truncate">{projectTitle === 'Untitled Comic' ? t('manager.new_project') : projectTitle}</p>
        </div>
      </div>

      <div className="flex-1 py-6 space-y-6 overflow-y-auto px-3 custom-scrollbar">
        {deptOrder.map(deptNameKey => (
            <div key={deptNameKey}>
                <div className="hidden lg:flex items-center gap-2 px-4 mb-2">
                    <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider whitespace-nowrap">{t(deptNameKey)}</p>
                    <div className="h-px bg-slate-100 flex-1"></div>
                </div>
                
                <div className="space-y-1">
                    {departments[deptNameKey]?.map((agent) => {
                        const isActive = currentRole === agent.id;
                        return (
                            <button
                            key={agent.id}
                            onClick={() => onSelectRole(agent.id)}
                            className={`w-full px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all duration-200 group relative overflow-hidden
                                ${isActive ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}
                            `}
                            >
                            {isActive && <div className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-r-full" />}
                            <div className={`shrink-0 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                {getIcon(agent.id)}
                            </div>
                            <div className="hidden lg:block text-left">
                                <div className="text-sm font-medium leading-none mb-1">{t(agent.name)}</div>
                            </div>
                            {isActive && <ChevronRight className="w-3 h-3 ml-auto text-indigo-400 hidden lg:block"/>}
                            </button>
                        );
                    })}
                </div>
            </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-3">
         <div className="bg-white rounded-xl p-2 hidden lg:flex items-center justify-between border border-slate-200 shadow-sm">
             <span className="text-xs text-slate-500 font-bold px-2">{t('ui.language')}</span>
             <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                 <button 
                    onClick={() => setUiLanguage('en')}
                    className={`px-2 py-1 text-[10px] font-bold rounded ${uiLanguage === 'en' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                 >EN</button>
                 <button 
                    onClick={() => setUiLanguage('vi')}
                    className={`px-2 py-1 text-[10px] font-bold rounded ${uiLanguage === 'vi' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                 >VN</button>
             </div>
         </div>

         <div className="bg-white rounded-xl p-4 hidden lg:block border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
                <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">{t('sidebar.cloud')}</p>
                <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded">{t('sidebar.online')}</span>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-full animate-pulse"></div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Sidebar;
