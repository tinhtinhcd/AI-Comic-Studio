
import React from 'react';
import { AgentRole, ComicProject, Character, ResearchData } from '../types';
import { AGENTS } from '../constants';
import { MessageCircle, Loader2, Send, FileText, TrendingUp, Upload, Download, BookOpen, Sparkles, Lightbulb, Users, Feather, CheckCircle, RefreshCw, Lock, Unlock, ScanFace } from 'lucide-react';

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
}> = ({ project, handleResearchChatSend, researchChatInput, setResearchChatInput, handleFinalizeStrategyFromChat, loading, t, chatEndRef, role }) => {
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
                            <div><label className="text-xs text-slate-400 font-bold uppercase block mb-1">World Setting</label><p className="text-indigo-600 font-medium">{project.marketAnalysis.worldSetting}</p></div>
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
}> = ({ project, handleImportScript, handleExportScript, handleApproveResearchAndScript, updateProject, loading, t, writerLogsEndRef, role }) => {
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

// --- CHARACTER DESIGNER VIEW ---
export const CharacterDesignerView: React.FC<{
    project: ComicProject;
    handleFinishCharacterDesign: () => void;
    handleRegenerateSingleCharacter: (char: Character, index: number) => void;
    handleUpdateCharacterDescription: (index: number, desc: string) => void;
    handleUpdateCharacterVoice: (index: number, voice: string) => void;
    toggleCharacterLock: (id: string) => void;
    handleCharacterUpload: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
    handleCheckConsistency: (char: Character, index: number) => void;
    role: AgentRole;
    t: (k: string) => string;
    availableVoices: string[];
}> = ({ project, handleFinishCharacterDesign, handleRegenerateSingleCharacter, handleUpdateCharacterDescription, handleUpdateCharacterVoice, toggleCharacterLock, handleCharacterUpload, handleCheckConsistency, role, t, availableVoices }) => {
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
                                  <button onClick={() => handleCheckConsistency(char, idx)} className="p-3 bg-white rounded-full text-slate-800 hover:text-blue-600 shadow-lg transform hover:scale-110 transition-all" title="Check Consistency">
                                      <ScanFace className="w-5 h-5"/>
                                  </button>
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
                                 
                                 <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Voice</label>
                                    <select 
                                        value={char.voice || availableVoices[0]} 
                                        onChange={(e) => handleUpdateCharacterVoice(idx, e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-xs text-slate-600 focus:border-purple-300 outline-none"
                                    >
                                        {availableVoices.map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
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
