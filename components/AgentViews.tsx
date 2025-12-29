import React from 'react';
import { AgentRole, ComicProject, ComicPanel, Character, WorkflowStage, ResearchData } from '../types';
import { AGENTS } from '../constants';
import { Settings, ArrowLeft, FileText, CheckCircle, X, Archive, Activity, LayoutTemplate, BookOpen, Library, Smartphone, FolderOpen, TrendingUp, ShieldAlert, Send, Loader2, MessageCircle, Upload, Download, Terminal, Edit2, Search, Users, Mic, ScanFace, AlertTriangle, Palette, RefreshCw, Lock, Unlock, Globe, Trash2, ArrowRight, Video, Film, Play, UserPlus, Pencil, Sparkles, BrainCircuit, ScrollText, Feather, Lightbulb, Plus, Printer, Book, Eye, Volume2 } from 'lucide-react';

// --- MANAGER VIEW ---
interface ManagerViewProps {
    project: ComicProject;
    activeProjects: ComicProject[];
    updateProject: (updates: Partial<ComicProject>) => void;
    handleLoadWIP: (p: ComicProject) => void;
    handleDeleteWIP: (e: React.MouseEvent, id: string) => void;
    handleStartResearch: () => void;
    handleApproveResearchAndScript: () => void;
    handleApproveScriptAndVisualize: () => void;
    handleFinalizeProduction: () => void;
    handleImportManuscript: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleExportProjectZip: () => void;
    handleImportProjectZip: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleAddLanguage: (lang: string) => void;
    toggleTargetLanguage?: (lang: string) => void;
    setInputText: (val: string) => void;
    inputText: string;
    loading: boolean;
    t: (key: string) => string;
    isLongFormat: boolean;
    supportedLanguages: string[];
}

export const ManagerView: React.FC<ManagerViewProps> = ({ 
    project, activeProjects, updateProject, handleLoadWIP, handleDeleteWIP, 
    handleStartResearch, handleApproveResearchAndScript, handleApproveScriptAndVisualize, handleFinalizeProduction,
    handleImportManuscript, handleExportProjectZip, handleImportProjectZip, handleAddLanguage,
    setInputText, inputText, loading, t, isLongFormat, supportedLanguages
}) => {
    
    // DASHBOARD MODE
    if (!project.storyFormat) {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div>
                   <div className="flex justify-between items-center mb-4">
                       <h3 className="font-bold text-slate-800 flex items-center gap-2"><Activity className="w-5 h-5 text-indigo-600"/> {t('ui.resume')}</h3>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       {[0, 1, 2].map(i => {
                           const slotProject = activeProjects[i];
                           return slotProject ? (
                               <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all relative group cursor-pointer hover:border-indigo-300" onClick={() => handleLoadWIP(slotProject)}>
                                   <div className="flex justify-between items-start mb-3">
                                       <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">{slotProject.storyFormat?.replace('_', ' ')}</span>
                                       <button onClick={(e) => handleDeleteWIP(e, slotProject.id!)} className="text-slate-300 hover:text-red-500 p-1 z-20 transition-colors"><Trash2 className="w-4 h-4"/></button>
                                   </div>
                                   <h4 className="font-bold text-lg text-slate-800 truncate mb-1">{slotProject.title || "Untitled Project"}</h4>
                                   <p className="text-xs text-slate-500 mb-6">{t('ui.last_edited')}: {new Date(slotProject.lastModified || Date.now()).toLocaleDateString()}</p>
                                   <button className="w-full bg-slate-900 text-white text-xs font-bold py-3 rounded-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200">
                                       {t('ui.open_project')} <ArrowRight className="w-3 h-3"/>
                                   </button>
                               </div>
                           ) : (
                               <div key={i} className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 flex flex-col items-center justify-center text-slate-300 h-48 transition-colors hover:border-slate-300">
                                   <span className="text-xs font-bold uppercase tracking-widest">{t('ui.empty_slot')} {i+1}</span>
                               </div>
                           );
                       })}
                   </div>
                </div>

                <div>
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><LayoutTemplate className="w-5 h-5 text-indigo-600"/> {t('ui.start_new')}</h3>
                    
                    {project.originalScript && (
                        <div className="mb-4 bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                            <CheckCircle className="w-5 h-5 text-emerald-600"/>
                            <div>
                                <p className="text-sm font-bold text-emerald-800">{t('ui.manuscript_loaded')}</p>
                                <p className="text-xs text-emerald-600">{t('ui.select_format_hint')}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <button onClick={() => updateProject({ storyFormat: 'SHORT_STORY' })} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-xl transition-all text-left group relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><BookOpen className="w-24 h-24 text-indigo-600"/></div>
                           <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 w-fit mb-4 border border-indigo-100"><BookOpen className="w-6 h-6"/></div>
                           <h4 className="font-bold text-lg text-slate-900 mb-2">{t('fmt.short')}</h4>
                           <p className="text-sm text-slate-500 leading-relaxed">{t('fmt.short.desc')}</p>
                       </button>

                       <button onClick={() => updateProject({ storyFormat: 'LONG_SERIES' })} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-purple-500 hover:shadow-xl transition-all text-left group relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Library className="w-24 h-24 text-purple-600"/></div>
                           <div className="p-3 bg-purple-50 rounded-xl text-purple-600 w-fit mb-4 border border-purple-100"><Library className="w-6 h-6"/></div>
                           <h4 className="font-bold text-lg text-slate-900 mb-2">{t('fmt.series')}</h4>
                           <p className="text-sm text-slate-500 leading-relaxed">{t('fmt.series.desc')}</p>
                       </button>

                       <button onClick={() => updateProject({ storyFormat: 'EPISODIC' })} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-xl transition-all text-left group relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Smartphone className="w-24 h-24 text-emerald-600"/></div>
                           <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 w-fit mb-4 border border-emerald-100"><Smartphone className="w-6 h-6"/></div>
                           <h4 className="font-bold text-lg text-slate-900 mb-2">{t('fmt.episodic')}</h4>
                           <p className="text-sm text-slate-500 leading-relaxed">{t('fmt.episodic.desc')}</p>
                       </button>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><FolderOpen className="w-5 h-5 text-indigo-600"/> {t('ui.quick_import')}</h3>
                    <div className="flex gap-4">
                        <label className="flex-1 bg-white border border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 rounded-xl p-6 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 text-center group">
                            <FileText className="w-8 h-8 text-slate-400 group-hover:text-indigo-500"/>
                            <span className="font-bold text-sm text-slate-600 group-hover:text-indigo-700">{t('ui.import_script_btn')}</span>
                            <input type="file" accept=".txt,.md" onChange={handleImportManuscript} className="hidden" />
                        </label>
                        <label className="flex-1 bg-white border border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 rounded-xl p-6 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 text-center group">
                            <Archive className="w-8 h-8 text-slate-400 group-hover:text-indigo-500"/>
                            <span className="font-bold text-sm text-slate-600 group-hover:text-indigo-700">{t('ui.import_config_btn')}</span>
                            <input type="file" accept=".zip" onChange={handleImportProjectZip} className="hidden" />
                        </label>
                    </div>
                </div>
            </div>
        );
    }

    // SETTINGS MODE
    return (
        <div className="flex flex-col lg:flex-row gap-8 h-full pb-8">
            <div className="lg:col-span-1 space-y-6 flex flex-col">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex-1">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-blue-600" /> {t('manager.settings')}
                        </h3>
                        <button 
                            onClick={() => updateProject({ storyFormat: null })} 
                            className="text-slate-400 hover:text-indigo-600 flex items-center gap-1 text-xs font-bold p-1 rounded-lg hover:bg-indigo-50 transition-all"
                            title="Change Pipeline Format"
                        >
                            <ArrowLeft className="w-4 h-4" /> {t('ui.back')}
                        </button>
                    </div>
                    
                    <div className="space-y-6">
                        {/* Publication Type Selector */}
                        <div>
                            <label className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2 block">{t('manager.pub_type')}</label>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => updateProject({ publicationType: 'COMIC' })}
                                    className={`flex-1 py-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-2 ${project.publicationType === 'COMIC' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                >
                                    <BookOpen className="w-4 h-4"/> {t('type.comic')}
                                </button>
                                <button 
                                    onClick={() => updateProject({ publicationType: 'NOVEL' })}
                                    className={`flex-1 py-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-2 ${project.publicationType === 'NOVEL' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                >
                                    <FileText className="w-4 h-4"/> {t('type.novel')}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-2 block">{t('manager.theme')}</label>
                            <textarea
                                value={project.theme || inputText}
                                onChange={(e) => { setInputText(e.target.value); updateProject({ theme: e.target.value }); }}
                                disabled={project.workflowStage !== WorkflowStage.IDLE && project.workflowStage !== WorkflowStage.RESEARCHING}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 min-h-[100px] focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none placeholder-slate-400 transition-all hover:bg-white focus:bg-white"
                                placeholder={project.originalScript ? "Detected from manuscript..." : t('manager.themeplaceholder')}
                            />
                        </div>

                        <div>
                            <label className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-2 block flex justify-between">
                                {t('manager.target_langs')}
                                <span className="text-slate-400 text-[10px]">Master: {project.masterLanguage}</span>
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {project.targetLanguages.map(lang => (
                                    <span key={lang} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-50 border border-purple-200 text-purple-700 flex items-center gap-1">
                                        {lang}
                                    </span>
                                ))}
                            </div>
                            
                            <div className="relative group">
                                <button className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-2 rounded-xl w-full justify-center border border-indigo-200 border-dashed hover:border-solid transition-all">
                                    <Plus className="w-3 h-3"/> {t('ui.add_lang')}
                                </button>
                                <div className="hidden group-hover:block absolute top-full left-0 right-0 bg-white border border-slate-200 shadow-xl rounded-xl mt-2 z-50 max-h-48 overflow-y-auto p-2">
                                    {supportedLanguages.filter(l => !project.targetLanguages.includes(l)).map(lang => (
                                        <button 
                                            key={lang}
                                            onClick={() => handleAddLanguage(lang)}
                                            className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 text-slate-700 font-medium rounded-lg transition-colors"
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <label className="text-xs text-pink-600 font-bold uppercase tracking-wider mb-2 block">{t('manager.style')}</label>
                            <select value={project.style} onChange={(e) => updateProject({ style: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl py-3 px-3 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-pink-100 focus:border-pink-300 transition-all cursor-pointer">
                                <option value="Japanese Manga (B&W)">{t('style.manga')}</option>
                                <option value="Anime / Cel Shaded">{t('style.anime')}</option>
                                <option value="Webtoon (Full Color)">{t('style.webtoon')}</option>
                                <option value="3D Render / CGI Style">{t('style.3d')}</option>
                                <option value="Modern Western Comic">{t('style.western')}</option>
                                <option value="Wuxia (Traditional Ink)">{t('style.wuxia')}</option>
                                <option value="Noir / High Contrast">{t('style.noir')}</option>
                                <option value="Cyberpunk / Neon">{t('style.cyberpunk')}</option>
                                <option value="Realism / Photorealistic">{t('style.realism')}</option>
                                <option value="Photorealistic (Cinematic)">{t('style.photoreal')}</option>
                                <option value="Xianxia / Cultivation (Manhua)">{t('style.cultivation')}</option>
                                <option value="Modern Slice of Life">{t('style.modern_sol')}</option>
                            </select>
                        </div>
                        
                        <div className="border-t border-slate-100 pt-6 mt-2">
                            <button 
                                onClick={handleExportProjectZip}
                                className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold py-3 rounded-xl transition-colors border border-slate-200"
                            >
                                <Archive className="w-4 h-4"/> {t('ui.export_zip_btn')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-1 flex flex-col gap-4">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-full">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                        <Activity className="w-5 h-5 text-emerald-600" /> {t('manager.pipeline')}
                    </h3>
                    
                    <div className="space-y-3">
                        <button onClick={handleStartResearch} disabled={loading || (!project.theme && !project.originalScript) || !project.storyFormat} className={`w-full py-4 px-5 rounded-xl flex items-center justify-between text-sm font-medium border transition-all ${project.workflowStage === WorkflowStage.IDLE ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-800 shadow-md shadow-indigo-100' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                            <div className="flex items-center gap-3"><TrendingUp className="w-4 h-4"/><span className="font-bold">{t('action.start_research')}</span></div>
                        </button>
                        
                        <button onClick={handleApproveResearchAndScript} disabled={loading || !project.marketAnalysis || !project.storyConcept} className={`w-full py-4 px-5 rounded-xl flex items-center justify-between text-sm font-medium border transition-all ${project.workflowStage === WorkflowStage.RESEARCHING ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-800 shadow-md shadow-emerald-100' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                            <div className="flex items-center gap-3"><BookOpen className="w-4 h-4"/><span className="font-bold">{project.originalScript ? t('action.adapt_script') : t('action.approve_script')}</span></div>
                        </button>

                        <button onClick={handleApproveScriptAndVisualize} disabled={loading || project.panels.length === 0 || project.characters.length === 0} className={`w-full py-4 px-5 rounded-xl flex items-center justify-between text-sm font-medium border transition-all ${project.workflowStage === WorkflowStage.CENSORING_SCRIPT ? 'bg-gradient-to-r from-rose-50 to-rose-100 border-rose-200 text-rose-800 shadow-md shadow-rose-100' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                            <div className="flex items-center gap-3"><Palette className="w-4 h-4"/><span className="font-bold">{t('action.approve_art')}</span></div>
                        </button>
                        
                        {/* New Button for Printing Stage - Strict check for images */}
                        <button onClick={handleFinalizeProduction} disabled={loading || !project.panels.some(p => p.imageUrl) || project.workflowStage !== WorkflowStage.PRINTING} className={`w-full py-4 px-5 rounded-xl flex items-center justify-between text-sm font-medium border transition-all ${project.workflowStage === WorkflowStage.PRINTING ? 'bg-gradient-to-r from-slate-100 to-slate-200 border-slate-300 text-slate-800 shadow-md shadow-slate-200' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                            <div className="flex items-center gap-3"><Printer className="w-4 h-4"/><span className="font-bold">{t('action.start_printing')}</span></div>
                        </button>

                        <button disabled={project.workflowStage !== WorkflowStage.POST_PRODUCTION} className={`w-full py-4 px-5 rounded-xl flex items-center justify-between text-sm font-medium border transition-all ${project.workflowStage === WorkflowStage.POST_PRODUCTION ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 text-amber-800 shadow-md shadow-amber-100' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                            <div className="flex items-center gap-3"><Archive className="w-4 h-4"/><span className="font-bold">{isLongFormat ? t('action.finalize_chapter') : t('action.finalize_prod')}</span></div>
                        </button>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                    <h3 className="font-bold text-slate-800">{t('manager.logs')}</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white font-mono text-xs">
                    {project.logs.length === 0 && <div className="text-slate-400 text-center italic mt-10">{t('ui.waiting')}</div>}
                    {project.logs.map((log) => (
                        <div key={log.id} className="flex gap-2">
                            <span className="text-slate-400 shrink-0">[{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}]</span>
                            <div className="flex-1">
                                <span className="text-blue-600 font-bold">{t(AGENTS[log.agentId].name)}: </span>
                                <span className="text-slate-700">{log.message}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- RESEARCH VIEW ---
export const ResearchView: React.FC<{ 
    project: ComicProject;
    handleResearchChatSend: () => void;
    researchChatInput: string;
    setResearchChatInput: (s: string) => void;
    handleFinalizeStrategyFromChat: () => void;
    handleUpdateMarketAnalysis: (data: ResearchData) => void;
    loading: boolean;
    t: (k: string) => string;
    chatEndRef: React.RefObject<HTMLDivElement>;
    role: AgentRole;
}> = ({ project, handleResearchChatSend, researchChatInput, setResearchChatInput, handleFinalizeStrategyFromChat, handleUpdateMarketAnalysis, loading, t, chatEndRef, role }) => {
    return (
        <div className="max-w-7xl mx-auto w-full px-6 pb-8 h-[calc(100vh-140px)] flex flex-col">
            <div className="flex items-center gap-6 mb-4 shrink-0">
                <img src={AGENTS[role].avatar} className="w-16 h-16 rounded-full border-2 border-indigo-200 shadow-md" />
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">{t(AGENTS[role].name)}</h2>
                    <p className="text-slate-500">{t('planner.desc')}</p>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <span className="font-bold text-slate-700 flex items-center gap-2"><MessageCircle className="w-4 h-4"/> {t('planner.chatTitle')}</span>
                        {project.researchChatHistory?.length > 0 && (
                            <button onClick={handleFinalizeStrategyFromChat} disabled={loading} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                                {loading ? <Loader2 className="w-3 h-3 animate-spin inline mr-1"/> : null} {t('planner.finalize')}
                            </button>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                         {project.researchChatHistory?.map((msg, idx) => (
                             <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                 <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'}`}>
                                     {msg.content}
                                 </div>
                             </div>
                         ))}
                         <div ref={chatEndRef} />
                    </div>
                    <div className="p-3 border-t border-slate-100 bg-white">
                        <div className="flex gap-2 relative">
                             <input 
                                value={researchChatInput}
                                onChange={(e) => setResearchChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleResearchChatSend()}
                                placeholder={t('planner.chatPlaceholder')}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all"
                             />
                             <button 
                                onClick={handleResearchChatSend}
                                disabled={loading || !researchChatInput.trim()}
                                className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
                             >
                                 {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}
                             </button>
                        </div>
                    </div>
                </div>

                <div className="w-1/3 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-y-auto hidden lg:block">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4"><FileText className="w-5 h-5 text-indigo-500"/> {t('planner.formTitle')}</h3>
                    {project.marketAnalysis ? (
                        <div className="space-y-6 text-sm">
                            <div><label className="text-xs text-slate-400 font-bold uppercase block mb-1">Title</label><p className="font-serif text-lg font-bold text-slate-900">{project.marketAnalysis.suggestedTitle}</p></div>
                            <div><label className="text-xs text-slate-400 font-bold uppercase block mb-1">Logline</label><p className="text-slate-600 leading-relaxed">{project.marketAnalysis.narrativeStructure}</p></div>
                            <div><label className="text-xs text-slate-400 font-bold uppercase block mb-1">Visual Style</label><span className="bg-pink-50 text-pink-700 px-2 py-1 rounded border border-pink-100 font-medium inline-block">{project.marketAnalysis.visualStyle}</span></div>
                            <div><label className="text-xs text-slate-400 font-bold uppercase block mb-1">Audience</label><p className="text-slate-600">{project.marketAnalysis.targetAudience}</p></div>
                        </div>
                    ) : (
                         <div className="text-center text-slate-400 mt-20 flex flex-col items-center gap-2">
                             <TrendingUp className="w-12 h-12 opacity-20"/>
                             <p>{t('ui.waiting')}</p>
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- WRITER VIEW ---
export const WriterView: React.FC<{
    project: ComicProject;
    handleImportScript: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleExportScript: () => void;
    handleApproveResearchAndScript: () => void;
    updateProject: (updates: Partial<ComicProject>) => void;
    loading: boolean;
    t: (k: string) => string;
    scriptStep: 'CONCEPT' | 'CASTING' | 'WRITING';
    writerLogsEndRef: React.RefObject<HTMLDivElement>;
    role: AgentRole;
    isLongFormat: boolean;
}> = ({ project, handleImportScript, handleExportScript, handleApproveResearchAndScript, updateProject, loading, t, scriptStep, writerLogsEndRef, role, isLongFormat }) => {
    return (
        <div className="max-w-7xl mx-auto w-full px-6 pb-8 h-[calc(100vh-140px)] flex flex-col">
            <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center gap-6">
                    <img src={AGENTS[role].avatar} className="w-16 h-16 rounded-full border-2 border-emerald-200 shadow-md" />
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">{t(AGENTS[role].name)}</h2>
                        <p className="text-slate-500">Scriptwriting & World Building</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <label className="bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 text-slate-500 px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all shadow-sm flex items-center gap-2">
                         <Upload className="w-4 h-4"/> {t('ui.import_script_btn')}
                         <input type="file" accept=".json,.txt" onChange={handleImportScript} className="hidden" />
                    </label>
                    <button onClick={handleExportScript} className="bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 text-slate-500 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2">
                        <Download className="w-4 h-4"/> {t('manager.export_file')}
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                 <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                          <h3 className="font-bold text-slate-800 flex items-center gap-2"><BookOpen className="w-4 h-4 text-emerald-600"/> Script Editor - {t('ui.current_chapter')} {project.currentChapter || 1}</h3>
                          {project.panels.length > 0 && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">{project.panels.length} {t('ui.panels')}</span>}
                      </div>
                      <div className="flex-1 overflow-y-auto p-6 bg-white space-y-6">
                           {project.panels.length === 0 ? (
                               <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
                                   <Feather className="w-16 h-16 opacity-20"/>
                                   <p>{t('writer.empty')}</p>
                                   <button onClick={handleApproveResearchAndScript} disabled={loading} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2">
                                       {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5"/>}
                                       {t('writer.generate')}
                                   </button>
                               </div>
                           ) : (
                               project.panels.map((panel, idx) => (
                                   <div key={panel.id} className="group relative pl-8 border-l-2 border-slate-100 hover:border-emerald-300 transition-colors">
                                       <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-slate-200 group-hover:border-emerald-400 text-[9px] flex items-center justify-center font-bold text-slate-400 group-hover:text-emerald-500">{idx+1}</span>
                                       <div className="mb-2">
                                           <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{t('writer.visual_desc')}</p>
                                           <textarea 
                                               className="w-full bg-slate-50 border-0 rounded-lg p-3 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-100 outline-none resize-none"
                                               value={panel.description}
                                               rows={3}
                                               onChange={(e) => {
                                                   const newPanels = [...project.panels];
                                                   newPanels[idx].description = e.target.value;
                                                   updateProject({ panels: newPanels });
                                               }}
                                           />
                                       </div>
                                       <div>
                                           <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{t('writer.dialogue')}</p>
                                            <textarea 
                                               className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm font-comic text-slate-900 focus:border-emerald-300 outline-none resize-none"
                                               value={panel.dialogue}
                                               rows={2}
                                               onChange={(e) => {
                                                   const newPanels = [...project.panels];
                                                   newPanels[idx].dialogue = e.target.value;
                                                   updateProject({ panels: newPanels });
                                               }}
                                           />
                                       </div>
                                   </div>
                               ))
                           )}
                           <div ref={writerLogsEndRef} />
                      </div>
                 </div>

                 <div className="lg:col-span-1 space-y-4 overflow-y-auto">
                      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                          <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-amber-500"/> Concept</h4>
                          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                              {project.storyConcept?.premise || t('ui.waiting')}
                          </p>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                           <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-purple-500"/> Cast</h4>
                           <div className="space-y-2">
                               {project.characters.map(char => (
                                   <div key={char.id} className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded-lg">
                                       <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 overflow-hidden">
                                           {char.imageUrl ? <img src={char.imageUrl} className="w-full h-full object-cover"/> : char.name[0]}
                                       </div>
                                       <span className="font-bold text-slate-700">{char.name}</span>
                                       <span className="ml-auto text-[10px] text-slate-400 uppercase">{char.role}</span>
                                   </div>
                               ))}
                               {project.characters.length === 0 && <span className="text-xs text-slate-400 italic">{t('err.no_chars')}</span>}
                           </div>
                      </div>
                 </div>
            </div>
        </div>
    );
};

// --- VOICE VIEW ---
export const VoiceView: React.FC<{
    project: ComicProject;
    handleUpdateCharacterVoice: (index: number, voice: string) => void;
    handleVerifyVoice: (char: Character) => void;
    applyVoiceSuggestion: (index: number, voice: string) => void;
    voiceAnalysis: Record<string, {isSuitable: boolean, suggestion: string, reason: string}>;
    analyzingVoiceId: string | null;
    role: AgentRole;
    t: (k: string) => string;
    availableVoices: string[];
}> = ({ project, handleUpdateCharacterVoice, handleVerifyVoice, applyVoiceSuggestion, voiceAnalysis, analyzingVoiceId, role, t, availableVoices }) => {
    return (
        <div className="max-w-7xl mx-auto w-full px-6 pb-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                    <img src={AGENTS[role].avatar} className="w-16 h-16 rounded-full border-2 border-pink-200 shadow-md" />
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">{t(AGENTS[role].name)}</h2>
                        <p className="text-slate-500">Audio Casting & Direction</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {project.characters.map((char, idx) => {
                    const analysis = voiceAnalysis[char.id];
                    return (
                        <div key={char.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-pink-300 transition-all">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                                    {char.imageUrl ? <img src={char.imageUrl} className="w-full h-full object-cover" /> : <Users className="w-6 h-6 text-slate-300 m-4"/>}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">{char.name}</h3>
                                    <span className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{char.role}</span>
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">{t('voice.actor')}</label>
                                <select 
                                    value={char.voice || availableVoices[0]}
                                    onChange={(e) => handleUpdateCharacterVoice(idx, e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-medium text-slate-700 focus:border-pink-300 outline-none"
                                >
                                    {availableVoices.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                                <button 
                                    onClick={() => handleVerifyVoice(char)}
                                    disabled={analyzingVoiceId === char.id}
                                    className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1"
                                >
                                    {analyzingVoiceId === char.id ? <Loader2 className="w-3 h-3 animate-spin"/> : <ScanFace className="w-3 h-3"/>}
                                    {t('voice.audit')}
                                </button>
                            </div>

                            {analysis && (
                                <div className={`mt-4 p-3 rounded-xl text-xs ${analysis.isSuitable ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-800 border border-amber-100'}`}>
                                    <p className="font-bold mb-1 flex items-center gap-1">
                                        {analysis.isSuitable ? <CheckCircle className="w-3 h-3"/> : <AlertTriangle className="w-3 h-3"/>}
                                        {analysis.isSuitable ? t('voice.match') : t('voice.mismatch')}
                                    </p>
                                    <p className="leading-relaxed opacity-90 mb-2">{analysis.reason}</p>
                                    {!analysis.isSuitable && (
                                        <button 
                                            onClick={() => applyVoiceSuggestion(idx, analysis.suggestion)}
                                            className="bg-white border border-amber-200 text-amber-700 px-2 py-1 rounded shadow-sm hover:bg-amber-100 font-bold w-full"
                                        >
                                            Switch to {analysis.suggestion}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- CHARACTER DESIGNER VIEW ---
export const CharacterDesignerView: React.FC<{
    project: ComicProject;
    handleFinishCharacterDesign: () => void;
    handleRegenerateSingleCharacter: (char: Character, index: number) => void;
    handleUpdateCharacterDescription: (index: number, desc: string) => void;
    handleUpdateCharacterVoice: (index: number, voice: string) => void;
    toggleCharacterLock: (id: string) => void;
    handleCharacterUpload: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
    role: AgentRole;
    t: (k: string) => string;
    availableVoices: string[];
}> = ({ project, handleFinishCharacterDesign, handleRegenerateSingleCharacter, handleUpdateCharacterDescription, handleUpdateCharacterVoice, toggleCharacterLock, handleCharacterUpload, role, t, availableVoices }) => {
    return (
        <div className="max-w-7xl mx-auto w-full px-6 pb-24">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                    <img src={AGENTS[role].avatar} className="w-16 h-16 rounded-full border-2 border-purple-200 shadow-md" />
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">{t(AGENTS[role].name)}</h2>
                        <p className="text-slate-500">Model Sheets & Visual Development</p>
                    </div>
                </div>
                <button onClick={handleFinishCharacterDesign} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-200 transition-all">
                    <CheckCircle className="w-5 h-5"/> {t('designer.finalize')}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {project.characters.map((char, idx) => (
                    <div key={char.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group">
                         <div className="aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center">
                             {char.isGenerating ? (
                                 <div className="flex flex-col items-center gap-2 text-purple-600">
                                     <Loader2 className="w-8 h-8 animate-spin"/>
                                     <span className="text-xs font-bold uppercase tracking-wider">{t('designer.generating')}</span>
                                 </div>
                             ) : char.imageUrl ? (
                                 <img src={char.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                             ) : (
                                 <Users className="w-12 h-12 text-slate-300"/>
                             )}
                             
                             {/* Overlay Controls */}
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                                  <button onClick={() => handleRegenerateSingleCharacter(char, idx)} className="p-3 bg-white rounded-full text-slate-800 hover:text-purple-600 shadow-lg transform hover:scale-110 transition-all" title="Regenerate">
                                      <RefreshCw className="w-5 h-5"/>
                                  </button>
                                  <label className="p-3 bg-white rounded-full text-slate-800 hover:text-blue-600 shadow-lg transform hover:scale-110 transition-all cursor-pointer" title="Upload Reference">
                                      <Upload className="w-5 h-5"/>
                                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCharacterUpload(e, idx)} />
                                  </label>
                                  <button onClick={() => toggleCharacterLock(char.id)} className={`p-3 rounded-full shadow-lg transform hover:scale-110 transition-all ${char.isLocked ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 hover:text-emerald-500'}`} title="Lock Design">
                                      {char.isLocked ? <Lock className="w-5 h-5"/> : <Unlock className="w-5 h-5"/>}
                                  </button>
                             </div>
                         </div>
                         
                         <div className="p-5">
                             <div className="flex justify-between items-start mb-4">
                                 <div>
                                     <h3 className="font-bold text-lg text-slate-900">{char.name}</h3>
                                     <span className="text-xs text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded">{char.role}</span>
                                 </div>
                             </div>

                             <div className="space-y-3">
                                 <div>
                                     <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">{t('designer.visual_prompt')}</label>
                                     <textarea 
                                         className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-xs text-slate-600 focus:border-purple-300 outline-none resize-none h-20"
                                         value={char.description}
                                         onChange={(e) => handleUpdateCharacterDescription(idx, e.target.value)}
                                     />
                                 </div>
                             </div>
                         </div>
                         
                         {char.consistencyReport && (
                             <div className={`px-5 py-3 text-[10px] font-medium border-t ${char.consistencyStatus === 'PASS' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                 <span className="font-bold block mb-1">{char.consistencyStatus === 'PASS' ? 'Style Check Passed' : 'Style Inconsistency Detected'}</span>
                                 {char.consistencyReport}
                             </div>
                         )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- TYPESETTER VIEW ---
export const TypesetterView: React.FC<{
    project: ComicProject;
    handleFinishPrinting: () => void;
    role: AgentRole;
    t: (k: string) => string;
}> = ({ project, handleFinishPrinting, role, t }) => {
    return (
        <div className="max-w-7xl mx-auto w-full px-6 pb-24">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                    <img src={AGENTS[role].avatar} className="w-16 h-16 rounded-full border-2 border-slate-500 shadow-md" />
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">{t(AGENTS[role].name)}</h2>
                        <p className="text-slate-500">Lettering & Page Layout</p>
                    </div>
                </div>
                <button onClick={handleFinishPrinting} className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-slate-300 transition-all">
                    <Printer className="w-5 h-5"/> {t('ui.confirm')}
                </button>
            </div>

            <div className="bg-slate-200 p-8 rounded-xl overflow-x-auto">
                 <div className="flex gap-8 min-w-max">
                     {/* Simulating Pages - Grouping panels into pages of 4 for visualization */}
                     {Array.from({ length: Math.ceil(project.panels.length / 4) }).map((_, pageIdx) => (
                         <div key={pageIdx} className="w-[400px] h-[600px] bg-white shadow-2xl flex flex-col relative shrink-0">
                             <div className="absolute -top-6 left-0 font-bold text-slate-500 text-xs">Page {pageIdx + 1}</div>
                             <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-1 p-4">
                                 {project.panels.slice(pageIdx * 4, (pageIdx + 1) * 4).map((panel) => (
                                     <div key={panel.id} className="relative border border-slate-900 bg-slate-100 overflow-hidden">
                                          {panel.imageUrl && <img src={panel.imageUrl} className="w-full h-full object-cover grayscale-[0.2]" />}
                                          <div className="absolute inset-0 p-2 pointer-events-none">
                                               {panel.dialogue && (
                                                   <div className="bg-white border border-black rounded-[10px] p-1 text-[8px] font-comic uppercase text-center w-3/4 mx-auto shadow-sm">
                                                       {panel.dialogue}
                                                   </div>
                                               )}
                                          </div>
                                     </div>
                                 ))}
                             </div>
                             <div className="h-8 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                                 {pageIdx + 1}
                             </div>
                         </div>
                     ))}
                 </div>
            </div>
        </div>
    );
};

// --- MOTION VIEW ---
export const MotionView: React.FC<{
    project: ComicProject;
    handleGeneratePanelVideo: (panel: ComicPanel, index: number) => void;
    loading: boolean;
    role: AgentRole;
    t: (k: string) => string;
}> = ({ project, handleGeneratePanelVideo, loading, role, t }) => {
     return (
        <div className="max-w-7xl mx-auto w-full px-6 pb-24">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                    <img src={AGENTS[role].avatar} className="w-16 h-16 rounded-full border-2 border-orange-200 shadow-md" />
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">{t(AGENTS[role].name)}</h2>
                        <p className="text-slate-500">Video Generation (Veo)</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {project.panels.map((panel, idx) => (
                    <div key={panel.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm group">
                        <div className="aspect-video bg-slate-900 relative">
                             {panel.videoUrl ? (
                                 <video src={panel.videoUrl} className="w-full h-full object-cover" controls loop playsInline />
                             ) : panel.imageUrl ? (
                                 <img src={panel.imageUrl} className="w-full h-full object-cover opacity-80" />
                             ) : (
                                 <div className="flex items-center justify-center h-full text-slate-600"><Film className="w-8 h-8"/></div>
                             )}

                             {!panel.videoUrl && (
                                 <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                     {panel.isGenerating ? (
                                         <Loader2 className="w-10 h-10 text-white animate-spin"/>
                                     ) : (
                                         <button 
                                            onClick={() => handleGeneratePanelVideo(panel, idx)}
                                            className="w-12 h-12 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-lg hover:bg-orange-700 transition-all transform group-hover:scale-110"
                                         >
                                             <Play className="w-5 h-5 fill-current ml-1"/>
                                         </button>
                                     )}
                                 </div>
                             )}
                        </div>
                        <div className="p-4">
                            <h4 className="font-bold text-sm text-slate-700 mb-1">Panel #{idx+1}</h4>
                            <p className="text-xs text-slate-500 line-clamp-2">{panel.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
     );
};

// --- CONTINUITY VIEW ---
export const ContinuityView: React.FC<{
    project: ComicProject;
    handleRunContinuityCheck: () => void;
    loading: boolean;
    role: AgentRole;
    t: (k: string) => string;
}> = ({ project, handleRunContinuityCheck, loading, role, t }) => {
     return (
        <div className="max-w-7xl mx-auto w-full px-6 pb-24">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                    <img src={AGENTS[role].avatar} className="w-16 h-16 rounded-full border-2 border-teal-500 shadow-md" />
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">{t(AGENTS[role].name)}</h2>
                        <p className="text-slate-500">Logic & Plot Consistency</p>
                    </div>
                </div>
                <button onClick={handleRunContinuityCheck} disabled={loading} className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-teal-200 transition-all disabled:opacity-50">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <ScanFace className="w-5 h-5"/>}
                    Check Continuity
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                 <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                     <FileText className="w-5 h-5 text-teal-600"/> Continuity Report
                 </h3>
                 <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 min-h-[200px] text-sm leading-relaxed whitespace-pre-wrap font-mono text-slate-700">
                     {project.continuityReport || <span className="text-slate-400 italic">No report generated yet. Run a check to analyze the script logic.</span>}
                 </div>
            </div>
        </div>
    );
};

// --- CENSOR VIEW ---
export const CensorView: React.FC<{
    project: ComicProject;
    handleRunCensorCheck: () => void;
    loading: boolean;
    role: AgentRole;
    t: (k: string) => string;
}> = ({ project, handleRunCensorCheck, loading, role, t }) => {
     return (
        <div className="max-w-7xl mx-auto w-full px-6 pb-24">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                    <img src={AGENTS[role].avatar} className="w-16 h-16 rounded-full border-2 border-red-500 shadow-md" />
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">{t(AGENTS[role].name)}</h2>
                        <p className="text-slate-500">Content Safety & Compliance</p>
                    </div>
                </div>
                <button onClick={handleRunCensorCheck} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-red-200 transition-all disabled:opacity-50">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <ShieldAlert className="w-5 h-5"/>}
                    Run Compliance Scan
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                     <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                         <Activity className="w-5 h-5 text-red-600"/> Status
                     </h3>
                     <div className={`p-4 rounded-xl border flex items-center gap-3 ${project.isCensored ? 'bg-red-50 border-red-100 text-red-800' : project.censorReport ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                         {project.isCensored ? <AlertTriangle className="w-6 h-6"/> : project.censorReport ? <CheckCircle className="w-6 h-6"/> : <ShieldAlert className="w-6 h-6 opacity-50"/>}
                         <div>
                             <p className="font-bold text-lg">{project.censorReport ? (project.isCensored ? 'Issues Detected' : 'Content Passed') : 'Pending Scan'}</p>
                             <p className="text-xs opacity-80">{project.censorReport ? (project.isCensored ? 'Action required.' : 'Safe for publication.') : 'Awaiting analysis.'}</p>
                         </div>
                     </div>
                 </div>

                 <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                     <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                         <FileText className="w-5 h-5 text-red-600"/> Report Details
                     </h3>
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 min-h-[150px] text-xs leading-relaxed whitespace-pre-wrap text-slate-700">
                         {project.censorReport || <span className="text-slate-400 italic">No report available.</span>}
                     </div>
                 </div>
            </div>
        </div>
    );
};

// --- TRANSLATOR VIEW ---
export const TranslatorView: React.FC<{
    project: ComicProject;
    updateProject: (updates: Partial<ComicProject>) => void;
    handleAddLanguage: (lang: string) => void;
    loading: boolean;
    role: AgentRole;
    t: (k: string) => string;
}> = ({ project, updateProject, handleAddLanguage, loading, role, t }) => {
    const [newLangInput, setNewLangInput] = React.useState('');

    return (
        <div className="max-w-7xl mx-auto w-full px-6 pb-24">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                    <img src={AGENTS[role].avatar} className="w-16 h-16 rounded-full border-2 border-cyan-500 shadow-md" />
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">{t(AGENTS[role].name)}</h2>
                        <p className="text-slate-500">Localization & Translation</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-fit">
                     <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                         <Globe className="w-5 h-5 text-cyan-600"/> Languages
                     </h3>
                     <div className="space-y-3 mb-6">
                         {project.targetLanguages.map(lang => (
                             <div key={lang} className="flex items-center justify-between p-3 rounded-xl border bg-cyan-50 border-cyan-100 text-cyan-800">
                                 <span className="font-bold text-sm">{lang}</span>
                                 {lang === project.masterLanguage && <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-cyan-200 font-bold uppercase text-cyan-600">Master</span>}
                             </div>
                         ))}
                     </div>
                     
                     <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                         <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">{t('ui.add_lang')}</label>
                         <div className="flex gap-2">
                             <input 
                                value={newLangInput}
                                onChange={(e) => setNewLangInput(e.target.value)}
                                placeholder="e.g. Spanish"
                                className="flex-1 text-sm p-2 rounded-lg border border-slate-200 outline-none focus:border-cyan-400"
                             />
                             <button 
                                onClick={() => { handleAddLanguage(newLangInput); setNewLangInput(''); }}
                                disabled={loading || !newLangInput.trim()}
                                className="bg-cyan-600 hover:bg-cyan-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
                             >
                                 {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4"/>}
                             </button>
                         </div>
                     </div>
                 </div>

                 <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                     <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                         <BookOpen className="w-5 h-5 text-cyan-600"/> Content Preview
                     </h3>
                     {project.panels.length === 0 ? (
                         <div className="text-center text-slate-400 py-12 italic">No panels content to translate yet.</div>
                     ) : (
                         <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                             {project.panels.map((panel, idx) => (
                                 <div key={panel.id} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                     <div className="flex items-center gap-2 mb-2">
                                         <span className="bg-slate-200 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">Panel #{idx+1}</span>
                                         <span className="text-xs text-slate-400 font-mono truncate flex-1">{panel.description.substring(0, 50)}...</span>
                                     </div>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <div>
                                             <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Original ({project.masterLanguage})</label>
                                             <p className="text-sm text-slate-800 bg-white p-2 rounded border border-slate-200">{panel.dialogue || <span className="text-slate-300 italic">No dialogue</span>}</p>
                                         </div>
                                         {project.targetLanguages.filter(l => l !== project.masterLanguage).map(lang => (
                                             <div key={lang}>
                                                 <label className="text-[10px] font-bold text-cyan-600 uppercase block mb-1">{lang}</label>
                                                 <p className="text-sm text-slate-800 bg-white p-2 rounded border border-cyan-100">{panel.translations?.[lang]?.dialogue || <span className="text-slate-300 italic">Pending...</span>}</p>
                                             </div>
                                         ))}
                                     </div>
                                 </div>
                             ))}
                         </div>
                     )}
                 </div>
            </div>
        </div>
    );
};
