
import React from 'react';
import { AgentRole, ComicProject, ComicPanel, Character, WorkflowStage, ResearchData } from '../types';
import { AGENTS } from '../constants';
import { Settings, ArrowLeft, FileText, CheckCircle, X, Archive, Activity, LayoutTemplate, BookOpen, Library, Smartphone, FolderOpen, TrendingUp, ShieldAlert, Send, Loader2, MessageCircle, Upload, Download, Terminal, Edit2, Search, Users, Mic, ScanFace, AlertTriangle, Palette, RefreshCw, Lock, Unlock, Globe, Trash2, ArrowRight, Video, Film, Play, UserPlus, Pencil, Sparkles, BrainCircuit, ScrollText, Feather, Lightbulb, Plus, Printer, Book } from 'lucide-react';

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
                        
                        <button onClick={handleApproveResearchAndScript} disabled={loading || !project.marketAnalysis} className={`w-full py-4 px-5 rounded-xl flex items-center justify-between text-sm font-medium border transition-all ${project.workflowStage === WorkflowStage.RESEARCHING ? 'bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-800 shadow-md shadow-emerald-100' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                            <div className="flex items-center gap-3"><BookOpen className="w-4 h-4"/><span className="font-bold">{project.originalScript ? t('action.adapt_script') : t('action.approve_script')}</span></div>
                        </button>

                        <button onClick={handleApproveScriptAndVisualize} disabled={loading || !project.panels.length} className={`w-full py-4 px-5 rounded-xl flex items-center justify-between text-sm font-medium border transition-all ${project.workflowStage === WorkflowStage.CENSORING_SCRIPT ? 'bg-gradient-to-r from-rose-50 to-rose-100 border-rose-200 text-rose-800 shadow-md shadow-rose-100' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                            <div className="flex items-center gap-3"><Palette className="w-4 h-4"/><span className="font-bold">{t('action.approve_art')}</span></div>
                        </button>
                        
                        {/* New Button for Printing Stage */}
                        <button onClick={handleFinalizeProduction} disabled={loading || !project.panels.some(p => p.imageUrl)} className={`w-full py-4 px-5 rounded-xl flex items-center justify-between text-sm font-medium border transition-all ${project.workflowStage === WorkflowStage.PRINTING ? 'bg-gradient-to-r from-slate-100 to-slate-200 border-slate-300 text-slate-800 shadow-md shadow-slate-200' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
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
interface ResearchViewProps {
    project: ComicProject;
    handleResearchChatSend: () => void;
    researchChatInput: string;
    setResearchChatInput: (val: string) => void;
    handleFinalizeStrategyFromChat: () => void;
    handleUpdateMarketAnalysis: (data: ResearchData) => void;
    loading: boolean;
    t: (key: string) => string;
    chatEndRef: React.RefObject<HTMLDivElement>;
    role: AgentRole;
}

export const ResearchView: React.FC<ResearchViewProps> = ({ project, handleResearchChatSend, researchChatInput, setResearchChatInput, handleFinalizeStrategyFromChat, loading, t, chatEndRef, role }) => {
    return (
        <div className="max-w-7xl mx-auto w-full px-6 pb-8 h-[80vh]">
            <div className="flex items-center gap-6 mb-8 shrink-0">
                <img src={AGENTS[role].avatar} className="w-16 h-16 rounded-full border-2 border-indigo-200 shadow-md" />
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{t('planner.title')}</h2>
                    <p className="text-slate-500">{t('planner.desc')}</p>
                </div>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-6 h-full pb-10">
                <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
                    <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{t('planner.chatTitle')}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                        {project.researchChatHistory?.map((msg, i) => (
                            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-200">
                        <div className="flex gap-2">
                            <input value={researchChatInput} onChange={(e) => setResearchChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleResearchChatSend()} className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all" placeholder={t('planner.chatPlaceholder')} />
                            <button onClick={handleResearchChatSend} className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl transition-colors shadow-lg shadow-indigo-200"><Send className="w-5 h-5"/></button>
                        </div>
                    </div>
                </div>
                <div className="w-full lg:w-1/3 flex flex-col gap-4">
                    <button onClick={handleFinalizeStrategyFromChat} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-all">{loading ? <Loader2 className="animate-spin w-5 h-5"/> : <CheckCircle className="w-6 h-6"/>} {t('planner.confirmBtn')}</button>
                </div>
            </div>
        </div>
    );
};

// --- WRITER VIEW ---
interface WriterViewProps {
    project: ComicProject;
    handleImportScript: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleExportScript: () => void;
    handleApproveResearchAndScript: () => void;
    updateProject: (updates: Partial<ComicProject>) => void;
    loading: boolean;
    t: (key: string) => string;
    scriptStep: 'CONCEPT' | 'CASTING' | 'WRITING';
    writerLogsEndRef: React.RefObject<HTMLDivElement>;
    role: AgentRole;
    isLongFormat: boolean;
}

export const WriterView: React.FC<WriterViewProps> = (props) => {
    const { storyConcept, characters, seriesBible, panels } = props.project;
    const hasStarted = storyConcept || characters.length > 0 || panels.length > 0;

    return (
        <div className="max-w-6xl mx-auto w-full px-6 pb-12">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                    <img src={AGENTS[props.role].avatar} className="w-16 h-16 rounded-full border-2 border-emerald-200 shadow-md" />
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">{props.t(AGENTS[props.role].name)}</h2>
                        <p className="text-slate-500">Creative Workspace</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={props.handleExportScript} disabled={panels.length === 0} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm">
                        <Download className="w-4 h-4"/> Export JSON
                    </button>
                </div>
            </div>

            {!hasStarted && !props.loading && (
                <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-4">
                    <div className="p-4 bg-indigo-50 rounded-full text-indigo-500"><Feather className="w-8 h-8"/></div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-700">Ready to Write</h3>
                        <p className="text-slate-500 text-sm">Start the creative process to generate concept, cast, and script.</p>
                    </div>
                    <button onClick={props.handleApproveResearchAndScript} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 mt-2">
                        Start Writing
                    </button>
                </div>
            )}

            <div className="space-y-6">
                {/* 1. STORY CONCEPT */}
                {(storyConcept || (props.loading && props.scriptStep === 'CONCEPT')) && (
                    <div className={`bg-indigo-50 border border-indigo-100 p-6 rounded-2xl ${props.loading && props.scriptStep === 'CONCEPT' ? 'animate-pulse' : ''}`}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-indigo-800 flex items-center gap-2"><Lightbulb className="w-5 h-5"/> Story Concept</h3>
                            {storyConcept && <span className="bg-indigo-200 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">CONFIRMED</span>}
                        </div>
                        {storyConcept ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white/60 p-4 rounded-xl">
                                    <span className="text-xs font-bold text-indigo-400 uppercase">Premise</span>
                                    <p className="text-sm text-indigo-900 mt-1 font-medium leading-relaxed">{storyConcept.premise}</p>
                                </div>
                                <div className="space-y-3">
                                    <div className="bg-white/60 p-3 rounded-xl">
                                        <span className="text-xs font-bold text-indigo-400 uppercase">Unique Twist</span>
                                        <p className="text-sm text-indigo-900 mt-1">{storyConcept.uniqueTwist}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-32 text-indigo-400 font-medium gap-2 border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/50">
                                <Loader2 className="w-6 h-6 animate-spin"/>
                                <span>Generating Concept...</span>
                            </div>
                        )}
                    </div>
                )}

                {/* 2. CHARACTER CAST */}
                {(characters.length > 0 || (props.loading && props.scriptStep === 'CASTING')) && (
                    <div className={`bg-purple-50 border border-purple-100 p-6 rounded-2xl ${props.loading && props.scriptStep === 'CASTING' ? 'animate-pulse' : ''}`}>
                         <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-purple-800 flex items-center gap-2"><Users className="w-5 h-5"/> Character Cast</h3>
                            {characters.length > 0 && <span className="bg-purple-200 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">{characters.length} CHARACTERS</span>}
                        </div>
                        {characters.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {characters.map(c => (
                                    <div key={c.id} className="bg-white p-3 rounded-xl border border-purple-100 shadow-sm flex flex-col">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-purple-900">{c.name}</span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${c.role === 'MAIN' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{c.role}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 line-clamp-2 mb-2 flex-1">{c.description}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-32 text-purple-400 font-medium gap-2 border-2 border-dashed border-purple-200 rounded-xl bg-purple-50/50">
                                <Users className="w-6 h-6 animate-bounce"/>
                                <span>Casting Characters...</span>
                            </div>
                        )}
                    </div>
                )}

                {/* 4. SCRIPT DRAFT */}
                {(panels.length > 0 || (props.loading && props.scriptStep === 'WRITING')) && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2 border-b border-slate-200 pb-2">
                            <ScrollText className="w-5 h-5 text-slate-400"/>
                            <h3 className="font-bold text-slate-700">Script Draft: Chapter {props.project.currentChapter || 1}</h3>
                        </div>
                        {panels.length > 0 ? (
                            panels.map((panel, i) => (
                                <div key={panel.id} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:border-indigo-300 transition-colors group">
                                    <div className="flex justify-between mb-3">
                                        <span className="font-bold text-slate-400 text-xs tracking-widest">PANEL {i+1}</span>
                                        <div className="flex gap-1">
                                             {panel.charactersInvolved.map(c => <span key={c} className="bg-slate-100 text-slate-500 text-[10px] px-1.5 rounded">{c}</span>)}
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <p className="text-sm text-slate-700 mb-3 font-medium">{panel.description}</p>
                                            {panel.dialogue && (
                                                <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-xs text-indigo-800">
                                                    <span className="font-bold uppercase text-[10px] opacity-50 block mb-1">Dialogue</span>
                                                    "{panel.dialogue}"
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-3">
                                <Edit2 className="w-8 h-8 animate-pulse"/>
                                <span className="font-medium">Drafting Script & Dialogue... (This may take ~30s)</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            <div ref={props.writerLogsEndRef} />
        </div>
    );
};

export const VoiceView: React.FC<any> = (props) => {
    return (
        <div className="max-w-6xl mx-auto w-full px-6 pb-12">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                    <img src={AGENTS[props.role].avatar} className="w-16 h-16 rounded-full border-2 border-pink-300 shadow-md" />
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">{props.t(AGENTS[props.role].name)}</h2>
                        <p className="text-slate-500">Audio Engineering & Casting</p>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {props.project.characters.map((char: any, idx: number) => (
                    <div key={char.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                                <img src={char.imageUrl} className="w-full h-full object-cover"/>
                            </div>
                            <h4 className="font-bold text-slate-900">{char.name}</h4>
                        </div>
                        <select value={char.voice || 'Puck'} onChange={(e) => props.handleUpdateCharacterVoice(idx, e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl text-sm px-3 py-2 mb-3 outline-none focus:ring-2 focus:ring-pink-100">
                            {props.availableVoices.map((v:any) => <option key={v} value={v}>{v}</option>)}
                        </select>
                        <button onClick={() => props.handleVerifyVoice(char)} className="w-full py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors">
                            <ScanFace className="w-3 h-3"/> Verify Voice Match
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const MotionView: React.FC<any> = ({ project, handleGeneratePanelVideo, loading, role, t }) => {
    return (
        <div className="max-w-7xl mx-auto w-full px-6 pb-12 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                    <img src={AGENTS[role].avatar} className="w-16 h-16 rounded-full border-2 border-orange-300 shadow-md" />
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">{t(AGENTS[role].name)}</h2>
                        <p className="text-slate-500">Video Generation & VFX (Veo)</p>
                    </div>
                </div>
            </div>
            {project.panels.length === 0 || !project.panels.some((p:any) => p.imageUrl) ? (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center gap-4">
                    <Video className="w-12 h-12 text-slate-300"/>
                    <p className="text-slate-400 font-medium">No visualized panels yet. Please complete Panel Art first.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
                    {project.panels.map((panel: any, idx: number) => (
                        <div key={panel.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden group shadow-sm hover:shadow-md transition-all">
                            <div className="aspect-video bg-slate-900 relative flex items-center justify-center">
                                {panel.isGenerating ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-8 h-8 animate-spin text-orange-500"/>
                                        <span className="text-xs text-orange-400 font-mono">Generating Video...</span>
                                    </div>
                                ) : panel.videoUrl ? (
                                    <video src={panel.videoUrl} className="w-full h-full object-cover" controls loop playsInline muted />
                                ) : panel.imageUrl ? (
                                    <>
                                        <img src={panel.imageUrl} className="w-full h-full object-cover opacity-80" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                            <button 
                                                onClick={() => handleGeneratePanelVideo(panel, idx)}
                                                className="p-4 rounded-full bg-orange-600 text-white shadow-lg hover:bg-orange-700 hover:scale-110 transition-all"
                                            >
                                                <Video className="w-6 h-6"/>
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-slate-600 text-xs">Missing Image</div>
                                )}
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-slate-700 text-sm">Panel #{idx + 1}</h4>
                                    {panel.videoUrl && <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Film className="w-3 h-3"/> Ready</span>}
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2">{panel.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const CharacterDesignerView: React.FC<any> = ({ project, handleFinishCharacterDesign, handleRegenerateSingleCharacter, handleUpdateCharacterDescription, handleUpdateCharacterVoice, toggleCharacterLock, handleCharacterUpload, role, t, availableVoices }) => {
    return (
        <div className="max-w-7xl mx-auto w-full px-6 pb-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                    <img src={AGENTS[role].avatar} className="w-16 h-16 rounded-full border-2 border-purple-200 shadow-md" />
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{t('dept.visuals')}</h2>
                        <p className="text-slate-500">{t('step.casting')} - <span className="font-bold text-indigo-600">{project.style}</span></p>
                    </div>
                </div>
                <button onClick={handleFinishCharacterDesign} disabled={project.characters.length === 0} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-200 transition-all">
                    <CheckCircle className="w-5 h-5"/> {t('ui.confirm')}
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-24">
                {project.characters.map((char: any, idx: number) => (
                    <div key={char.id} className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all group hover:shadow-md ${char.isLocked ? 'border-emerald-400 ring-1 ring-emerald-100' : 'border-slate-200 hover:border-purple-300'}`}>
                        <div className="aspect-square bg-slate-50 relative flex items-center justify-center group-inner border-b border-slate-100">
                            {char.isGenerating ? (
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="w-8 h-8 animate-spin text-purple-600"/>
                                    <span className="text-xs font-bold text-purple-600 animate-pulse">Generating Visuals...</span>
                                </div>
                            ) : char.imageUrl ? (
                                <img src={char.imageUrl} className="w-full h-full object-cover"/>
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-2 text-slate-300">
                                    <UserPlus className="w-10 h-10"/>
                                    <span className="text-xs font-medium">Waiting for Visualization</span>
                                </div>
                            )}
                            
                            <div className={`absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 ${!char.imageUrl ? 'opacity-100 bg-transparent' : ''}`}>
                                {char.imageUrl && (
                                    <>
                                        <button onClick={() => handleRegenerateSingleCharacter(char, idx)} className="p-3 rounded-full bg-white text-slate-700 shadow-md hover:text-purple-600 border border-slate-200" title="Regenerate">
                                            <RefreshCw className="w-5 h-5"/>
                                        </button>
                                        <label className="p-3 rounded-full bg-slate-800 text-white cursor-pointer hover:bg-slate-900 shadow-md" title="Upload Image">
                                            <Upload className="w-5 h-5"/>
                                            <input type="file" className="hidden" onChange={(e) => handleCharacterUpload(e, idx)}/>
                                        </label>
                                    </>
                                )}
                                {!char.imageUrl && !char.isGenerating && (
                                     <button onClick={() => handleRegenerateSingleCharacter(char, idx)} className="px-4 py-2 rounded-full bg-purple-100 text-purple-700 shadow-sm border border-purple-200 hover:bg-purple-200 font-bold text-xs flex items-center gap-2">
                                        <Sparkles className="w-3 h-3"/> Generate
                                     </button>
                                )}
                            </div>
                        </div>

                        <div className="p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-slate-800">{char.name}</h3>
                                <button onClick={() => toggleCharacterLock(char.id)} className="p-1 hover:bg-slate-100 rounded">
                                    {char.isLocked ? <Lock className="w-4 h-4 text-emerald-500"/> : <Unlock className="w-4 h-4 text-slate-400"/>}
                                </button>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                                    <Pencil className="w-3 h-3" /> Visual Description
                                </label>
                                <textarea 
                                    value={char.description} 
                                    onChange={(e) => handleUpdateCharacterDescription(idx, e.target.value)} 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700 min-h-[80px] focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none resize-none"
                                    placeholder="Describe character visuals here..."
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface TypesetterViewProps {
    project: ComicProject;
    handleFinishPrinting: () => void;
    role: AgentRole;
    t: (key: string) => string;
}

export const TypesetterView: React.FC<TypesetterViewProps> = ({ project, handleFinishPrinting, role, t }) => {
    return (
        <div className="max-w-7xl mx-auto w-full px-6 pb-12 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                    <img src={AGENTS[role].avatar} className="w-16 h-16 rounded-full border-2 border-slate-600 shadow-md" />
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">{t(AGENTS[role].name)}</h2>
                        <p className="text-slate-500 flex items-center gap-2">
                            Mode: <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase text-xs border border-indigo-100">{t(`type.${project.publicationType.toLowerCase()}`)}</span>
                        </p>
                    </div>
                </div>
                <button onClick={handleFinishPrinting} className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-slate-300 transition-all">
                    <Printer className="w-5 h-5"/> {t('ui.confirm')}
                </button>
            </div>

            <div className="bg-slate-100 border border-slate-200 rounded-3xl p-12 min-h-[600px] flex flex-col items-center gap-12 shadow-inner">
                {project.panels.map((panel, i) => (
                    <div key={panel.id} className="w-full max-w-3xl bg-white shadow-2xl shadow-slate-300/50 p-12 min-h-[800px] relative transition-transform hover:scale-[1.01] duration-300">
                        {/* Header */}
                        <div className="flex justify-between text-[10px] text-slate-400 font-serif uppercase tracking-widest border-b border-slate-100 pb-2 mb-8">
                            <span>{project.title}</span>
                            <span>Page {i + 1}</span>
                        </div>

                        {/* Content based on Publication Type */}
                        {project.publicationType === 'COMIC' ? (
                            <div className="flex flex-col gap-4 h-full">
                                <div className="border-4 border-slate-900 p-2 flex-1 relative overflow-hidden group bg-slate-50">
                                    {panel.imageUrl ? (
                                        <img src={panel.imageUrl} className="w-full h-full object-cover grayscale-[20%] contrast-125" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-300 gap-2">
                                            <Printer className="w-12 h-12"/>
                                            <span className="font-bold text-xl uppercase tracking-widest">Art Pending</span>
                                        </div>
                                    )}
                                    {/* Simulated Speech Bubble */}
                                    {panel.dialogue && (
                                        <div className="absolute bottom-10 left-10 bg-white border-2 border-slate-900 p-6 rounded-[50%] max-w-[70%] shadow-lg z-10">
                                            <p className="font-comic text-sm text-center uppercase leading-tight font-bold">{panel.dialogue}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // NOVEL LAYOUT
                            <div className="font-serif text-slate-800 leading-loose text-lg">
                                {i === 0 && <h2 className="text-4xl font-bold mb-8 text-center border-b-2 border-black pb-4">{project.title}</h2>}
                                {panel.imageUrl && (
                                    <div className="float-right w-1/2 ml-8 mb-4 border border-slate-200 p-2 shadow-sm bg-white rotate-1">
                                        <img src={panel.imageUrl} className="w-full grayscale" />
                                        <p className="text-[10px] text-slate-400 text-center mt-2 italic font-sans">Fig {i+1}. {panel.description.substring(0, 20)}...</p>
                                    </div>
                                )}
                                <p className="mb-6 first-letter:text-5xl first-letter:font-bold first-letter:mr-2 first-letter:float-left">
                                    {panel.caption || "Hồi thứ nhất, khi mọi chuyện bắt đầu..."}
                                </p>
                                <p className="indent-8 mb-4">
                                    {panel.dialogue ? `"${panel.dialogue}"` : panel.description}
                                </p>
                                <p className="mt-4 text-justify text-slate-600 text-base">
                                    [...Văn bản tự động tạo bởi AI Typesetter để lấp đầy trang sách. Nội dung sẽ dựa trên phân cảnh và kịch bản gốc...]
                                </p>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="absolute bottom-6 left-0 right-0 text-center text-xs text-slate-300 font-serif">
                            - {i + 1} -
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
