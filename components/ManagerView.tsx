
import React from 'react';
import { ComicProject, WorkflowStage } from '../types';
import { Settings, ArrowLeft, FileText, CheckCircle, Archive, Activity, LayoutTemplate, BookOpen, Library, Smartphone, FolderOpen, TrendingUp, Palette, Printer, Plus, Trash2, ArrowRight, RotateCcw } from 'lucide-react';

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
    handleRevertStage: () => void; // New Prop
    handleImportManuscript: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleExportProjectZip: () => void;
    handleImportProjectZip: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleAddLanguage: (lang: string) => void;
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
    handleRevertStage,
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
                                <option value="Japanese Manga (B&W)">{t('style.manga_bw')}</option>
                                <option value="Japanese Manga (Color)">{t('style.manga_color')}</option>
                                <option value="Anime / Cel Shaded">{t('style.anime')}</option>
                                <option value="2D Animation / Cartoon">{t('style.animation_2d')}</option>
                                <option value="3D Render / CGI Style">{t('style.animation_3d')}</option>
                                <option value="Webtoon (Full Color)">{t('style.webtoon')}</option>
                                <option value="Wuxia (Traditional Ink)">{t('style.wuxia')}</option>
                                <option value="Noir / High Contrast">{t('style.noir')}</option>
                                <option value="Cyberpunk / Neon">{t('style.cyberpunk')}</option>
                                <option value="Realism / Photorealistic">{t('style.realism')}</option>
                                <option value="Photorealistic (Cinematic)">{t('style.photoreal')}</option>
                                <option value="Xianxia / Cultivation (Manhua)">{t('style.cultivation')}</option>
                                <option value="Modern Slice of Life">{t('style.modern_sol')}</option>
                                <option value="Modern Western Comic">{t('style.western')}</option>
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
                        
                        <button onClick={handleFinalizeProduction} disabled={loading || !project.panels.some(p => p.imageUrl) || project.workflowStage !== WorkflowStage.PRINTING} className={`w-full py-4 px-5 rounded-xl flex items-center justify-between text-sm font-medium border transition-all ${project.workflowStage === WorkflowStage.PRINTING ? 'bg-gradient-to-r from-slate-100 to-slate-200 border-slate-300 text-slate-800 shadow-md shadow-slate-200' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                            <div className="flex items-center gap-3"><Printer className="w-4 h-4"/><span className="font-bold">{t('action.start_printing')}</span></div>
                        </button>

                        <button disabled={project.workflowStage !== WorkflowStage.POST_PRODUCTION} className={`w-full py-4 px-5 rounded-xl flex items-center justify-between text-sm font-medium border transition-all ${project.workflowStage === WorkflowStage.POST_PRODUCTION ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 text-amber-800 shadow-md shadow-amber-100' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                            <div className="flex items-center gap-3"><Archive className="w-4 h-4"/><span className="font-bold">{isLongFormat ? t('action.finalize_chapter') : t('action.finalize_prod')}</span></div>
                        </button>

                        {/* Revert Button */}
                        {project.workflowStage !== WorkflowStage.IDLE && project.workflowStage !== WorkflowStage.RESEARCHING && (
                            <button 
                                onClick={handleRevertStage} 
                                disabled={loading}
                                className="w-full py-3 px-5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300 transition-all mt-4"
                            >
                                <RotateCcw className="w-3 h-3"/> Revert to Previous Stage
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
