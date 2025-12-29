
import React, { useState } from 'react';
import { AgentRole, ComicProject, Character, ComicPanel } from '../types';
import { AGENTS } from '../constants';
import { Printer, Users, Loader2, ScanFace, CheckCircle, AlertTriangle, Play, Film, FileText, ShieldAlert, Activity, Globe, Plus, BookOpen } from 'lucide-react';

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
    const [newLangInput, setNewLangInput] = useState('');

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
