
import React from 'react';
import { Agent, AgentRole, UserProfile } from '../types';
import { AGENTS, TRANSLATIONS } from '../constants';
import { Users, BookOpen, PenTool, Layout, Palette, Megaphone, Mic, Video, Globe, TrendingUp, ShieldAlert, Archive, Briefcase, ChevronRight, Moon, Sun, LogOut } from 'lucide-react';
import { Logo } from './Logo';

interface SidebarProps {
  currentRole: AgentRole;
  onSelectRole: (role: AgentRole) => void;
  projectTitle: string;
  uiLanguage: 'en' | 'vi';
  setUiLanguage: (lang: 'en' | 'vi') => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  currentUser: UserProfile;
  onLogout?: () => void; // Optional for demo
}

const Sidebar: React.FC<SidebarProps> = ({ currentRole, onSelectRole, projectTitle, uiLanguage, setUiLanguage, theme, setTheme, currentUser, onLogout }) => {
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
    <div className="w-full sm:w-72 border-r flex flex-col h-full flex-shrink-0 transition-colors duration-300 z-20 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <div className="p-4 sm:p-6 border-b flex items-center gap-4 border-gray-100 dark:border-gray-700">
        <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center shrink-0 hover:scale-105 transition-transform duration-300 cursor-pointer drop-shadow-md">
          <Logo className="w-full h-full" />
        </div>
        <div className="overflow-hidden">
          <h1 className="font-bold text-sm sm:text-base truncate tracking-tight text-gray-900 dark:text-gray-100 font-comic uppercase">{t('app.title')}</h1>
          <p className="text-[11px] sm:text-xs truncate text-gray-500 dark:text-gray-400">{projectTitle === 'Untitled Comic' ? t('manager.new_project') : projectTitle}</p>
        </div>
      </div>

      <div className="flex-1 py-4 sm:py-6 space-y-6 overflow-y-auto px-3 custom-scrollbar">
        {deptOrder.map(deptNameKey => (
            <div key={deptNameKey}>
                <div className="flex items-center gap-2 px-4 mb-2">
                    <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider whitespace-nowrap text-gray-400 dark:text-gray-500">{t(deptNameKey)}</p>
                    <div className="h-px flex-1 bg-gray-50 dark:bg-gray-700"></div>
                </div>
                
                <div className="space-y-1">
                    {departments[deptNameKey]?.map((agent) => {
                        const isActive = currentRole === agent.id;
                        return (
                            <button
                            key={agent.id}
                            onClick={() => onSelectRole(agent.id)}
                            className={`w-full px-3 py-2 sm:py-2.5 rounded-lg flex items-center gap-3 transition-all duration-200 group relative overflow-hidden
                                ${isActive 
                                    ? 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-medium' 
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }
                            `}
                            >
                            {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-indigo-600 dark:bg-indigo-400" />}
                            <div className={`shrink-0 transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'}`}>
                                {getIcon(agent.id)}
                            </div>
                            <div className="text-left">
                                <div className="text-xs sm:text-sm leading-none mb-1">{t(agent.name)}</div>
                            </div>
                            {isActive && <ChevronRight className="w-3 h-3 ml-auto text-gray-400 dark:text-gray-500"/>}
                            </button>
                        );
                    })}
                </div>
            </div>
        ))}
      </div>

      <div className="p-4 border-t space-y-3 border-gray-100 dark:border-gray-700">
         {/* User Profile Snippet */}
         <div className="flex items-center gap-3 p-2 rounded-xl bg-indigo-50 dark:bg-gray-700/50 border border-indigo-100 dark:border-gray-600">
             <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-600 overflow-hidden shrink-0 border border-gray-200 dark:border-gray-500">
                 <img src={currentUser.avatar} className="w-full h-full object-cover"/>
             </div>
             <div className="flex-1 min-w-0">
                 <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{currentUser.username}</p>
                 <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{currentUser.studioName || "Comic Artist"}</p>
             </div>
             {/* Logout button disabled for demo */}
             <div className="p-1.5 rounded-lg text-gray-400" title="Demo Mode - Logout Disabled">
                 <LogOut className="w-4 h-4 opacity-50"/>
             </div>
         </div>

         <div className="rounded-xl p-2 flex flex-col sm:flex-row items-center justify-between gap-2 border shadow-sm bg-white dark:bg-gray-700 border-gray-100 dark:border-gray-600">
             <div className="flex gap-2">
                <button 
                    onClick={() => setTheme('light')}
                    className={`p-1.5 rounded-lg transition-all ${theme === 'light' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
                    title="Light Mode"
                >
                    <Sun className="w-4 h-4"/>
                </button>
                <button 
                    onClick={() => setTheme('dark')}
                    className={`p-1.5 rounded-lg transition-all ${theme === 'dark' ? 'bg-gray-600 text-indigo-400 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    title="Dark Mode"
                >
                    <Moon className="w-4 h-4"/>
                </button>
             </div>
             
             <div className="flex rounded-lg p-1 border bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-600">
                 <button 
                     onClick={() => setUiLanguage('en')}
                     className={`px-2 py-1 text-[10px] font-bold rounded ${uiLanguage === 'en' ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                 >EN</button>
                 {/* Vietnamese button disabled for demo */}
                 <button 
                     disabled
                     className="px-2 py-1 text-[10px] font-bold rounded text-gray-300 dark:text-gray-600 opacity-50 cursor-not-allowed"
                     title="Vietnamese disabled for demo"
                 >VN</button>
             </div>
         </div>
      </div>
    </div>
  );
};

export default Sidebar;
