
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import AgentWorkspace from './components/AgentWorkspace';
import FinalComicView from './components/FinalComicView';
import { AgentRole, ComicProject } from './types';
import { INITIAL_PROJECT_STATE } from './constants';
import { Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [activeRole, setActiveRole] = useState<AgentRole>(AgentRole.PROJECT_MANAGER);
  const [project, setProject] = useState<ComicProject>(INITIAL_PROJECT_STATE);
  const [showPreview, setShowPreview] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Default to Vietnamese as requested
  const [uiLanguage, setUiLanguage] = useState<'en' | 'vi'>('vi');

  const updateProject = (updates: Partial<ComicProject>) => {
    setProject(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)}>
           <div className="absolute left-0 top-0 bottom-0 bg-white w-64 shadow-2xl">
              <Sidebar 
                currentRole={activeRole} 
                onSelectRole={(role) => { setActiveRole(role); setMobileMenuOpen(false); }}
                projectTitle={project.title}
                uiLanguage={uiLanguage}
                setUiLanguage={setUiLanguage}
              />
           </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
         <Sidebar 
            currentRole={activeRole} 
            onSelectRole={setActiveRole}
            projectTitle={project.title}
            uiLanguage={uiLanguage}
            setUiLanguage={setUiLanguage}
         />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 border-b border-slate-200 flex items-center justify-between bg-white shadow-sm z-10">
           <button onClick={() => setMobileMenuOpen(true)}>
             <Menu className="w-6 h-6 text-slate-600" />
           </button>
           <span className="font-bold text-sm truncate max-w-[150px] text-slate-800">{project.title}</span>
           <button onClick={() => setShowPreview(!showPreview)} className="text-xs bg-slate-100 border border-slate-200 px-3 py-1 rounded text-slate-600 font-medium">
              {showPreview ? 'Hide' : 'View'} Comic
           </button>
        </div>

        <div className={`flex-1 overflow-hidden relative ${showPreview ? 'lg:mr-96' : ''}`}>
           <AgentWorkspace 
             role={activeRole}
             project={project}
             updateProject={updateProject}
             onAgentChange={setActiveRole} 
             uiLanguage={uiLanguage}
           />
        </div>

        {/* Preview Sidebar (Desktop Only toggle) */}
        {showPreview && (
          <div className="hidden lg:block">
            <FinalComicView project={project} />
          </div>
        )}

        <button 
          onClick={() => setShowPreview(!showPreview)}
          className={`hidden lg:flex fixed top-4 z-30 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 p-2 rounded-l-lg shadow-md items-center gap-2 transition-all duration-300 ${showPreview ? 'right-96' : 'right-0'}`}
        >
           {showPreview ? <X className="w-4 h-4"/> : <Menu className="w-4 h-4"/>}
        </button>
      </div>
    </div>
  );
};

export default App;
