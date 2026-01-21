/// <reference lib="dom" />
import React, { useState } from 'react';
import { AgentRole, ComicProject, Character } from '../types';
import { AGENTS } from '../constants';
import { Printer, Users, Loader2, ScanFace, CheckCircle, AlertTriangle, Play, Film, ShieldAlert, Activity, Globe, Plus, Mic, Clapperboard, Download, Megaphone, Share2, Sparkles, FolderDown, CheckSquare, Square, X, BookOpen } from 'lucide-react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import * as GeminiService from '../services/geminiService';
import JSZip from 'jszip';

export const TypesetterView: React.FC<any> = ({ project, handleFinishPrinting, role, t }) => {
    const panels = project.panels || [];
    return (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-16 sm:pb-24">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-4 sm:gap-6">
                    <img src={AGENTS[role as AgentRole].avatar} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-gray-500 shadow-md" />
                    <div>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">{t(AGENTS[role as AgentRole].name)}</h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Lettering & Page Layout</p>
                    </div>
                </div>
                <button onClick={handleFinishPrinting} className="w-full sm:w-auto bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-gray-300 dark:shadow-none transition-all">
                    <Printer className="w-5 h-5"/> {t('ui.confirm')}
                </button>
            </div>
            
            <div className="bg-gray-100 dark:bg-gray-800 p-4 sm:p-6 rounded-xl overflow-x-auto border border-gray-200 dark:border-gray-700">
                 <div className="flex gap-6 sm:gap-8 min-w-max">
                     {Array.from({ length: Math.ceil(panels.length / 4) }).map((_, pageIdx) => (
                         <div key={pageIdx} className="w-[280px] sm:w-[340px] md:w-[400px] h-[420px] sm:h-[510px] md:h-[600px] bg-white shadow-2xl flex flex-col relative shrink-0 border border-gray-200">
                             <div className="absolute -top-6 left-0 font-bold text-gray-500 dark:text-gray-400 text-xs">Page {pageIdx + 1}</div>
                             <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-1 p-4">
                                 {panels.slice(pageIdx * 4, (pageIdx + 1) * 4).map((panel: any) => (
                                     <div key={panel.id} className="relative border border-gray-900 bg-gray-100 overflow-hidden">
                                          {panel.imageUrl && <img src={panel.imageUrl} className="w-full h-full object-cover grayscale-[0.2]" />}
                                          <div className="absolute inset-0 p-2 pointer-events-none">
                                               {panel.dialogue && (
                                                   <div className="bg-white border border-black rounded-[10px] p-1 text-[8px] font-comic uppercase text-center w-3/4 mx-auto shadow-sm text-black">
                                                       {panel.dialogue}
                                                   </div>
                                               )}
                                          </div>
                                     </div>
                                 ))}
                             </div>
                             <div className="h-8 flex items-center justify-center text-[10px] text-gray-400 font-mono">
                                 {pageIdx + 1}
                             </div>
                         </div>
                     ))}
                 </div>
            </div>
        </div>
    );
};

export const VoiceView: React.FC<any> = ({ project, handleUpdateCharacterVoice, handleVerifyVoice, applyVoiceSuggestion, voiceAnalysis, analyzingVoiceId, role, t, availableVoices }) => {
    const characters = project.characters || [];
    return (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-6 sm:pb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-4 sm:gap-6">
                    <img src={AGENTS[role as AgentRole].avatar} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-pink-200 shadow-md" />
                    <div>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">{t(AGENTS[role as AgentRole].name)}</h2>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {characters.map((char: any, idx: number) => {
                    const analysis = voiceAnalysis[char.id];
                    return (
                        <div key={char.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:border-pink-300 dark:hover:border-pink-500 transition-all group">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden border border-gray-200 dark:border-gray-600 shadow-inner">
                                    {char.imageUrl ? <img src={char.imageUrl} className="w-full h-full object-cover" /> : <Users className="w-6 h-6 text-gray-300 dark:text-gray-500 m-4"/>}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{char.name}</h3>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-100 dark:border-gray-600">{char.role}</span>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="text-xs font-bold text-gray-400 uppercase block mb-1 flex items-center gap-2">
                                    {t('voice.actor')}
                                    {char.voice && <span className="bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300 px-1.5 rounded text-[10px]">{char.voice}</span>}
                                </label>
                                <div className="relative">
                                    <select 
                                        value={char.voice || availableVoices[0]}
                                        onChange={(e) => handleUpdateCharacterVoice(idx, (e.target as HTMLSelectElement).value)}
                                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg py-2 pl-3 pr-8 text-sm font-medium text-gray-700 dark:text-gray-300 focus:border-pink-300 outline-none appearance-none"
                                    >
                                        {availableVoices.map((v: string) => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                    <Mic className="w-4 h-4 text-gray-400 absolute right-2 top-2.5 pointer-events-none"/>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50 dark:border-gray-700">
                                <button 
                                    onClick={() => handleVerifyVoice(char)}
                                    disabled={analyzingVoiceId === char.id}
                                    className="text-xs font-bold text-pink-600 dark:text-pink-400 hover:text-pink-700 flex items-center gap-1 bg-pink-50 dark:bg-pink-900/20 px-3 py-2 rounded-lg transition-colors w-full justify-center"
                                >
                                    {analyzingVoiceId === char.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <ScanFace className="w-4 h-4"/>}
                                    {t('voice.audit')}
                                </button>
                            </div>
                            {analysis && (
                                <div className={`mt-4 p-4 rounded-xl text-xs border ${analysis.isSuitable ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300 border-amber-100 dark:border-amber-800'}`}>
                                    <p className="font-bold mb-2 flex items-center gap-2 text-sm">
                                        {analysis.isSuitable ? <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400"/> : <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400"/>}
                                        {analysis.isSuitable ? t('voice.match') : t('voice.mismatch')}
                                    </p>
                                    <p className="leading-relaxed opacity-90 mb-3 border-l-2 border-current pl-2">"{analysis.reason}"</p>
                                    {!analysis.isSuitable && (
                                        <button 
                                            onClick={() => applyVoiceSuggestion(idx, analysis.suggestion)}
                                            className="bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 px-3 py-2 rounded-lg shadow-sm hover:bg-amber-100 dark:hover:bg-amber-900/50 font-bold w-full flex items-center justify-center gap-2"
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

export const MotionView: React.FC<any> = ({ project, handleGeneratePanelVideo, loading, role, t }) => {
    const [selectedPanelIds, setSelectedPanelIds] = useState<Set<string>>(new Set());
    const panels = project.panels || [];
    const toggleSelection = (id: string) => { const newSet = new Set(selectedPanelIds); if (newSet.has(id)) newSet.delete(id); else newSet.add(id); setSelectedPanelIds(newSet); };
    
    return (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-16 sm:pb-24">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-4 sm:gap-6">
                    <img src={AGENTS[role as AgentRole].avatar} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-orange-200 shadow-md" />
                    <div>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">{t(AGENTS[role as AgentRole].name)}</h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Video Generation (Veo)</p>
                    </div>
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {panels.map((panel: any, idx: number) => (
                     <div key={panel.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm group relative">
                        {panel.videoUrl && <button onClick={() => toggleSelection(panel.id)} className={`absolute top-2 right-2 z-20 p-1.5 rounded-lg shadow-md transition-all ${selectedPanelIds.has(panel.id) ? 'bg-orange-600 text-white' : 'bg-white text-gray-400'}`}>{selectedPanelIds.has(panel.id) ? <CheckSquare className="w-5 h-5"/> : <Square className="w-5 h-5"/>}</button>}
                        <div className="aspect-video bg-gray-900 relative">
                             {panel.videoUrl ? <video src={panel.videoUrl} className="w-full h-full object-cover" controls loop playsInline /> : panel.imageUrl ? <img src={panel.imageUrl} className="w-full h-full object-cover opacity-80" /> : <div className="flex items-center justify-center h-full text-gray-600"><Film className="w-8 h-8"/></div>}
                             {!panel.videoUrl && <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors"><button onClick={() => handleGeneratePanelVideo(panel, idx)} className="w-12 h-12 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-lg"><Play className="w-5 h-5 fill-current ml-1"/></button></div>}
                        </div>
                     </div>
                ))}
             </div>
        </div>
    )
};

export const ContinuityView: React.FC<any> = ({ project, handleRunContinuityCheck, loading, role, t }) => (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-16 sm:pb-24">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-4 sm:gap-6">
                <img src={AGENTS[role as AgentRole].avatar} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-teal-500 shadow-md" />
                <div><h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">{t(AGENTS[role as AgentRole].name)}</h2></div>
            </div>
            <button onClick={handleRunContinuityCheck} disabled={loading} className="w-full sm:w-auto bg-teal-600 text-white px-6 py-3 rounded-xl font-bold">Check Continuity</button>
        </div>
        <div className="bg-white dark:bg-gray-800 border p-4 sm:p-6 rounded-2xl">{project.continuityReport || "No report."}</div>
    </div>
);

export const CensorView: React.FC<any> = ({ project, handleRunCensorCheck, loading, role, t }) => (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-16 sm:pb-24">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-4 sm:gap-6">
                <img src={AGENTS[role as AgentRole].avatar} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-red-500 shadow-md" />
                <div><h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">{t(AGENTS[role as AgentRole].name)}</h2></div>
            </div>
            <button onClick={handleRunCensorCheck} disabled={loading} className="w-full sm:w-auto bg-red-600 text-white px-6 py-3 rounded-xl font-bold">Run Scan</button>
        </div>
        <div className="bg-white dark:bg-gray-800 border p-4 sm:p-6 rounded-2xl">{project.censorReport || "No report."}</div>
    </div>
);

export const TranslatorView: React.FC<any> = ({ project, updateProject, handleAddLanguage, loading, role, t }) => {
    const [newLang, setNewLang] = useState('');

    const handleAdd = () => {
        if (newLang && !project.targetLanguages.includes(newLang)) {
            handleAddLanguage(newLang);
            setNewLang('');
        }
    };

    return (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-16 sm:pb-24">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-4 sm:gap-6">
                    <img src={AGENTS[role as AgentRole].avatar} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-cyan-500 shadow-md" />
                    <div>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">{t(AGENTS[role as AgentRole].name)}</h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Localization & Translation</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-6 shadow-sm">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-cyan-600"/> Target Languages
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {project.targetLanguages.map(lang => (
                                <span key={lang} className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-2 ${lang === project.activeLanguage ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800' : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-700'}`}>
                                    {lang}
                                    {lang === project.activeLanguage && <CheckCircle className="w-3 h-3"/>}
                                </span>
                            ))}
                        </div>
                        
                        <div className="flex gap-2">
                            <input 
                                value={newLang}
                                onChange={(e) => setNewLang(e.target.value)}
                                placeholder="Add Language"
                                className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-400"
                            />
                            <button 
                                onClick={handleAdd}
                                disabled={loading || !newLang}
                                className="bg-cyan-600 hover:bg-cyan-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <Plus className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                     <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-6 shadow-sm">
                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                             <h3 className="font-bold text-gray-800 dark:text-gray-100">Script Translation</h3>
                             <div className="flex flex-wrap gap-2">
                                 {project.targetLanguages.map(lang => (
                                     <button 
                                        key={lang}
                                        onClick={() => updateProject({ activeLanguage: lang })}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${project.activeLanguage === lang ? 'bg-cyan-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200'}`}
                                     >
                                         {lang}
                                     </button>
                                 ))}
                             </div>
                         </div>
                         
                         <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                             {project.panels.map((panel: any, idx: number) => {
                                 const currentTranslation = panel.translations?.[project.activeLanguage] || { dialogue: panel.dialogue, caption: panel.caption };
                                 const masterTranslation = panel.translations?.[project.masterLanguage] || { dialogue: panel.dialogue, caption: panel.caption };

                                 return (
                                     <div key={panel.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
                                         <div className="flex justify-between mb-2">
                                             <span className="text-xs font-bold text-gray-400 uppercase">Panel {idx + 1}</span>
                                             {panel.imageUrl && <img src={panel.imageUrl} className="w-8 h-8 object-cover rounded border border-gray-200"/>}
                                         </div>
                                         
                                         {project.activeLanguage !== project.masterLanguage && (
                                             <div className="mb-3 opacity-60">
                                                 <p className="text-xs font-bold text-gray-500 mb-1">{project.masterLanguage}:</p>
                                                 {masterTranslation.caption && <p className="text-xs text-gray-600 italic bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700 mb-1">{masterTranslation.caption}</p>}
                                                 {masterTranslation.dialogue && <p className="text-xs text-gray-800 bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">{masterTranslation.dialogue}</p>}
                                             </div>
                                         )}

                                         <div className="space-y-2">
                                              {panel.caption && (
                                                  <div>
                                                      <label className="text-[10px] font-bold text-cyan-600 uppercase">Caption ({project.activeLanguage})</label>
                                                      <textarea 
                                                          className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-sm focus:border-cyan-400 outline-none resize-none"
                                                          rows={2}
                                                          value={currentTranslation.caption || ''}
                                                          onChange={(e) => {
                                                              const newPanels = [...project.panels];
                                                              const newTranslations = { ...panel.translations, [project.activeLanguage]: { ...currentTranslation, caption: e.target.value } };
                                                              newPanels[idx] = { ...panel, translations: newTranslations };
                                                              updateProject({ panels: newPanels });
                                                          }}
                                                      />
                                                  </div>
                                              )}
                                              {panel.dialogue && (
                                                  <div>
                                                      <label className="text-[10px] font-bold text-cyan-600 uppercase">Dialogue ({project.activeLanguage})</label>
                                                      <textarea 
                                                          className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-sm focus:border-cyan-400 outline-none resize-none font-comic"
                                                          rows={2}
                                                          value={currentTranslation.dialogue || ''}
                                                          onChange={(e) => {
                                                              const newPanels = [...project.panels];
                                                              const newTranslations = { ...panel.translations, [project.activeLanguage]: { ...currentTranslation, dialogue: e.target.value } };
                                                              newPanels[idx] = { ...panel, translations: newTranslations };
                                                              updateProject({ panels: newPanels });
                                                          }}
                                                      />
                                                  </div>
                                              )}
                                         </div>
                                     </div>
                                 );
                             })}
                         </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

export const PublisherView: React.FC<{
    project: ComicProject;
    role: AgentRole;
    t: (k: string) => string;
}> = ({ project, role, t }) => {
    const [marketingData, setMarketingData] = useState<{blurb: string, socialPost: string, tagline: string} | null>(null);
    const [loading, setLoading] = useState(false);
    const [showReader, setShowReader] = useState(false);

    const generateMarketing = async () => {
        setLoading(true);
        try {
            const data = await GeminiService.generateMarketingCopy(project);
            setMarketingData(data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleExportCBZ = async () => {
        const zip = new JSZip();
        const panels = project.panels || [];
        
        panels.forEach((panel, i) => {
            if (panel.imageUrl) {
                const imgData = panel.imageUrl.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
                zip.file(`page_${String(i + 1).padStart(3, '0')}.png`, imgData, { base64: true });
            }
        });

        const metadata = {
            title: project.title,
            series: project.storyConcept?.premise,
            language: project.activeLanguage,
            summary: project.marketAnalysis?.suggestedTitle
        };
        zip.file("ComicInfo.json", JSON.stringify(metadata, null, 2));

        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${project.title.replace(/\s+/g, '_')}.cbz`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-16 sm:pb-24">
            {showReader && (
                <div className="fixed inset-0 z-50 bg-black flex flex-col">
                    <div className="p-3 sm:p-4 flex justify-between items-center text-white bg-gray-900 border-b border-gray-800">
                        <h3 className="font-bold">{project.title} - Reader</h3>
                        <button onClick={() => setShowReader(false)}><X className="w-6 h-6"/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col items-center gap-4">
                        {project.panels.map((panel, idx) => (
                             panel.imageUrl ? (
                                 <img key={idx} src={panel.imageUrl} className="max-w-full max-h-screen object-contain shadow-2xl" />
                             ) : null
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-4 sm:gap-6">
                    <img src={AGENTS[role].avatar} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-amber-500 shadow-md" />
                    <div>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">{t(AGENTS[role].name)}</h2>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Distribution & Marketing</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                     <button onClick={() => setShowReader(true)} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg">
                        <BookOpen className="w-5 h-5"/> Reader Mode
                    </button>
                    <button onClick={handleExportCBZ} className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg">
                        <FolderDown className="w-5 h-5"/> Download .CBZ
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-amber-600"/> Publication Ready
                    </h3>
                    <div className="space-y-4">
                         <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
                             <div><p className="text-xs font-bold text-gray-500 uppercase">Format</p><p className="font-bold text-gray-800 dark:text-gray-200">{project.storyFormat}</p></div>
                             <CheckCircle className="w-6 h-6 text-emerald-500"/>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-600"/> Marketing Kit
                        </h3>
                        <button onClick={generateMarketing} disabled={loading} className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 rounded-lg border border-amber-100 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors flex items-center gap-1">
                            {loading ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3"/>} AI Generate
                        </button>
                    </div>
                    {marketingData ? (
                        <div className="space-y-4 flex-1">
                            <div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Tagline</p><p className="text-lg font-black italic">"{marketingData.tagline}"</p></div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl"><p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Blurb</p><p className="text-sm">{marketingData.blurb}</p></div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4 min-h-[200px]"><Megaphone className="w-12 h-12 opacity-20"/><p className="text-sm">Generate copy.</p></div>
                    )}
                </div>
            </div>
        </div>
    );
};