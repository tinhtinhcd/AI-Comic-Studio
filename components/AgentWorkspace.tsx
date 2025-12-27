import React, { useState, useEffect, useRef } from 'react';
import { AgentRole, ComicProject, ComicPanel, Character, WorkflowStage, SystemLog } from '../types';
import { AGENTS } from '../constants';
import * as GeminiService from '../services/geminiService';
import { Send, RefreshCw, Image as ImageIcon, CheckCircle, Loader2, Sparkles, UserPlus, BookOpen, Users, Megaphone, Languages, Mic, Video, Play, Pause, Globe, TrendingUp, ShieldAlert, ArrowRight, Activity, Palette, XCircle, AlertTriangle, X } from 'lucide-react';

interface AgentWorkspaceProps {
  role: AgentRole;
  project: ComicProject;
  updateProject: (updates: Partial<ComicProject>) => void;
}

const AVAILABLE_VOICES = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];

const AgentWorkspace: React.FC<AgentWorkspaceProps> = ({ role, project, updateProject }) => {
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [generatedCharacterName, setGeneratedCharacterName] = useState('');
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  // Rejection State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectStage, setRejectStage] = useState<WorkflowStage | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Auto-scroll for logs
  const logsEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (role === AgentRole.PROJECT_MANAGER) {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [project.logs, role]);

  const addLog = (agentId: AgentRole, message: string, type: SystemLog['type'] = 'info') => {
      const newLog: SystemLog = {
          id: crypto.randomUUID(),
          agentId,
          message,
          timestamp: Date.now(),
          type
      };
      updateProject({ logs: [...project.logs, newLog] });
  };

  // ----------------------------------------------------------------------
  // REJECTION LOGIC
  // ----------------------------------------------------------------------
  const initiateReject = (stage: WorkflowStage) => {
      setRejectStage(stage);
      setRejectionReason('');
      setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
      if (!rejectStage || !rejectionReason.trim()) return;

      const reason = rejectionReason;
      setShowRejectModal(false);

      // Logic for rollback based on current stage
      switch (rejectStage) {
          case WorkflowStage.RESEARCHING: // Rejecting Market Analysis
              addLog(AgentRole.PROJECT_MANAGER, `REJECTED Market Research: "${reason}". Requesting re-analysis.`, 'error');
              updateProject({ 
                  workflowStage: WorkflowStage.IDLE,
                  marketAnalysis: '' // Clear bad analysis
              });
              break;

          case WorkflowStage.CENSORING_SCRIPT: // Rejecting Script
              addLog(AgentRole.PROJECT_MANAGER, `REJECTED Script: "${reason}". Sent back to Scriptwriter.`, 'error');
              updateProject({ 
                  workflowStage: WorkflowStage.RESEARCHING // Go back to research step to allow re-scripting
              });
              break;

          case WorkflowStage.POST_PRODUCTION: // Rejecting Visuals (Before Video)
              addLog(AgentRole.PROJECT_MANAGER, `REJECTED Visuals: "${reason}". Sent back to Art Department.`, 'error');
              updateProject({ 
                  workflowStage: WorkflowStage.CENSORING_SCRIPT // Go back to script approval to trigger re-draw
              });
              break;
            
          case WorkflowStage.COMPLETED: // Rejecting Final Cut
               addLog(AgentRole.PROJECT_MANAGER, `REJECTED Final Cut: "${reason}". Re-opening Post-Production.`, 'error');
               updateProject({
                   workflowStage: WorkflowStage.POST_PRODUCTION
               });
               break;

          default:
              break;
      }
  };

  // ----------------------------------------------------------------------
  // AUTONOMOUS WORKFLOW CONTROLLERS
  // ----------------------------------------------------------------------

  // Step 1: Market Research
  const handleStartResearch = async () => {
    if (!project.theme) return;
    setLoading(true);
    updateProject({ workflowStage: WorkflowStage.RESEARCHING });
    addLog(AgentRole.PROJECT_MANAGER, "Initializing Market Research for theme...", 'info');

    try {
        const analysis = await GeminiService.conductMarketResearch(project.theme);
        updateProject({ marketAnalysis: analysis });
        addLog(AgentRole.MARKET_RESEARCHER, "Research complete. Trends identified.", 'success');
    } catch (e) {
        addLog(AgentRole.MARKET_RESEARCHER, "Research failed due to connection error.", 'error');
    } finally {
        setLoading(false);
    }
  };

  // Step 2: Authorize Scripting (Triggered by Manager)
  const handleApproveResearchAndScript = async () => {
      setLoading(true);
      updateProject({ workflowStage: WorkflowStage.SCRIPTING });
      addLog(AgentRole.PROJECT_MANAGER, "Research Approved. Commissioning Scriptwriter.", 'info');

      try {
        // Scriptwriter works
        const result = await GeminiService.generateScript(project.theme, project.style);
        
        // Extract characters and assign voices
        const chars = result.panels.flatMap(p => p.charactersInvolved).reduce((acc: Character[], name) => {
            if (!acc.find(c => c.name === name)) {
                // AUTO-CASTING LOGIC: Assign a random voice from available list
                const randomVoice = AVAILABLE_VOICES[Math.floor(Math.random() * AVAILABLE_VOICES.length)];
                acc.push({ 
                    id: crypto.randomUUID(), 
                    name, 
                    description: `A character named ${name}`,
                    voice: randomVoice
                });
            }
            return acc;
        }, []);

        updateProject({ 
            title: result.title, 
            panels: result.panels,
            characters: chars,
            workflowStage: WorkflowStage.CENSORING_SCRIPT 
        });
        addLog(AgentRole.SCRIPTWRITER, `Script drafted with ${result.panels.length} panels. Voice casting complete.`, 'success');

        // Automatic Handoff to Censor
        addLog(AgentRole.CENSOR, "Scanning script for safety violations...", 'info');
        const scriptText = result.panels.map(p => p.description + " " + p.dialogue).join(" ");
        const censorResult = await GeminiService.censorContent(scriptText, 'SCRIPT');
        
        updateProject({ 
            isCensored: !censorResult.passed, 
            censorReport: censorResult.report 
        });

        if (censorResult.passed) {
            addLog(AgentRole.CENSOR, "Script PASSED safety inspection.", 'success');
        } else {
            addLog(AgentRole.CENSOR, `Script FAILED safety inspection: ${censorResult.report}`, 'error');
        }

      } catch (e) {
          addLog(AgentRole.SCRIPTWRITER, "Failed to generate script.", 'error');
      } finally {
          setLoading(false);
      }
  };

  // Step 3: Authorize Visuals (Triggered by Manager)
  const handleApproveScriptAndVisualize = async () => {
    if (project.isCensored) {
        alert("Cannot proceed. Script contains unsafe content.");
        return;
    }

    setLoading(true);
    updateProject({ workflowStage: WorkflowStage.DESIGNING_CHARACTERS });
    addLog(AgentRole.PROJECT_MANAGER, "Script Approved. Starting Visual Production.", 'info');

    try {
        // 1. Generate Characters
        addLog(AgentRole.CHARACTER_DESIGNER, `Designing ${project.characters.length} characters...`, 'info');
        const newChars = [...project.characters];
        
        for (let i = 0; i < newChars.length; i++) {
             const result = await GeminiService.generateCharacterDesign(newChars[i].name, project.theme);
             newChars[i] = { ...newChars[i], description: result.description, imageUrl: result.imageUrl };
             // Update intermediate state for UI feedback
             updateProject({ characters: [...newChars] }); 
        }
        addLog(AgentRole.CHARACTER_DESIGNER, "All characters designed.", 'success');

        // 2. Generate Panels
        updateProject({ workflowStage: WorkflowStage.VISUALIZING_PANELS });
        addLog(AgentRole.PANEL_ARTIST, `Drawing ${project.panels.length} panels...`, 'info');
        
        const newPanels = [...project.panels];
        for (let i = 0; i < newPanels.length; i++) {
             const imageUrl = await GeminiService.generatePanelImage(newPanels[i], project.style, newChars);
             newPanels[i] = { ...newPanels[i], imageUrl };
             updateProject({ panels: [...newPanels] });
        }
        addLog(AgentRole.PANEL_ARTIST, "Storyboards complete.", 'success');

        updateProject({ workflowStage: WorkflowStage.POST_PRODUCTION });

    } catch (e) {
        addLog(AgentRole.PROJECT_MANAGER, "Visual production encountered an error.", 'error');
    } finally {
        setLoading(false);
    }
  };

  // Step 4: Authorize Motion & Sound
  const handleFinalizeProduction = async () => {
    setLoading(true);
    addLog(AgentRole.PROJECT_MANAGER, "Greenlighting Post-Production (Motion & Sound).", 'info');
    
    // Check Veo key
    if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await (window as any).aistudio.openSelectKey();
        }
    }

    try {
        const newPanels = [...project.panels];

        // 1. Generate Voiceovers
        addLog(AgentRole.VOICE_ACTOR, "Recording dialogue...", 'info');
        for (let i = 0; i < newPanels.length; i++) {
            if (newPanels[i].dialogue) {
                 try {
                     // Determine who is speaking based on charactersInvolved
                     // Simple heuristic: Take the first character involved as the speaker
                     // In a real app, the scriptwriter would explicitly output the speaker ID
                     const speakerName = newPanels[i].charactersInvolved[0];
                     const speaker = project.characters.find(c => c.name === speakerName);
                     const voiceToUse = speaker?.voice || 'Puck'; // Default if not found

                     const audioUrl = await GeminiService.generateVoiceover(newPanels[i].dialogue, voiceToUse);
                     newPanels[i] = { ...newPanels[i], audioUrl };
                     updateProject({ panels: [...newPanels] });
                 } catch (err) {
                     console.warn("TTS failed for panel " + i);
                 }
            }
        }

        // 2. Generate Video (Cinematographer)
        addLog(AgentRole.CINEMATOGRAPHER, "Rendering motion graphics (Veo)...", 'info');
        for (let i = 0; i < newPanels.length; i++) {
            if (newPanels[i].imageUrl) {
                try {
                    const videoUrl = await GeminiService.generateVideo(newPanels[i].imageUrl!, newPanels[i].description);
                    newPanels[i] = { ...newPanels[i], videoUrl };
                    updateProject({ panels: [...newPanels] });
                } catch (err) {
                     console.warn("Video gen failed for panel " + i);
                     addLog(AgentRole.CINEMATOGRAPHER, `Skipping Video Panel ${i+1} due to error/unpaid key.`, 'warning');
                }
            }
        }
        
        updateProject({ workflowStage: WorkflowStage.COMPLETED });
        addLog(AgentRole.PUBLISHER, "Project Complete! Ready for final review.", 'success');

    } catch (e) {
        addLog(AgentRole.PROJECT_MANAGER, "Post-production error.", 'error');
    } finally {
        setLoading(false);
    }
  };

  // ----------------------------------------------------------------------
  // INDIVIDUAL AGENT RENDERERS (VIEW ONLY OR MANUAL OVERRIDE)
  // ----------------------------------------------------------------------

  if (role === AgentRole.PROJECT_MANAGER) {
    return (
      <div className="h-full flex flex-col max-w-6xl mx-auto w-full pt-6 px-4 relative">
        
        {/* REJECTION MODAL */}
        {showRejectModal && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
                <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl w-full max-w-md shadow-2xl transform transition-all">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-red-500 flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6" /> Reject Work
                        </h3>
                        <button onClick={() => setShowRejectModal(false)} className="text-zinc-500 hover:text-zinc-300">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-sm text-zinc-400 mb-4">
                        Provide feedback to the agent. Why are you rejecting this stage? The workflow will revert to the previous step.
                    </p>
                    <textarea 
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-zinc-200 focus:border-red-500 outline-none h-32 mb-4 resize-none"
                        placeholder="e.g., The tone is too dark, please make it lighter..."
                    />
                    <div className="flex justify-end gap-3">
                        <button 
                            onClick={() => setShowRejectModal(false)}
                            className="px-4 py-2 text-zinc-400 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleConfirmReject}
                            disabled={!rejectionReason.trim()}
                            className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium"
                        >
                            Confirm Rejection
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
            <img src={AGENTS[role].avatar} alt="Manager" className="w-16 h-16 rounded-full border-2 border-blue-500" />
            <div>
              <h2 className="text-2xl font-bold text-white">Mission Control</h2>
              <p className="text-zinc-400">Supervise your team of AI agents.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full pb-6">
            
            {/* Left: Input & Strategy */}
            <div className="lg:col-span-1 space-y-6 flex flex-col">
                 <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                    <h3 className="font-bold text-zinc-300 mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-500" />
                        Project Parameters
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-zinc-500 font-bold uppercase">Theme</label>
                            <textarea
                                value={project.theme || inputText}
                                onChange={(e) => {
                                    setInputText(e.target.value);
                                    updateProject({ theme: e.target.value });
                                }}
                                disabled={project.workflowStage !== WorkflowStage.IDLE && project.workflowStage !== WorkflowStage.RESEARCHING}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-sm text-zinc-100 mt-1 h-24 resize-none focus:border-blue-500 outline-none"
                                placeholder="Enter story concept..."
                            />
                        </div>
                        <div>
                           <label className="text-xs text-zinc-500 font-bold uppercase">Style</label>
                           <select 
                                value={project.style}
                                onChange={(e) => updateProject({ style: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-sm text-zinc-100 mt-1 outline-none"
                            >
                                <option>Modern Western Comic</option>
                                <option>Japanese Manga</option>
                                <option>Noir</option>
                            </select>
                        </div>
                    </div>
                 </div>

                 {/* Workflow Actions */}
                 <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 flex-1">
                    <h3 className="font-bold text-zinc-300 mb-4">Pipeline Control</h3>
                    <div className="space-y-3">
                        {/* PHASE 1 */}
                        <div className="space-y-2">
                             <div className="flex gap-2">
                                <button 
                                    onClick={handleStartResearch}
                                    disabled={loading || !project.theme || project.workflowStage !== WorkflowStage.IDLE}
                                    className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-between text-sm font-medium border transition-all
                                        ${project.workflowStage === WorkflowStage.IDLE ? 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}
                                    `}
                                >
                                    <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4"/> 1. Research</span>
                                    {project.marketAnalysis && <CheckCircle className="w-4 h-4 text-green-500"/>}
                                </button>
                                {project.workflowStage === WorkflowStage.RESEARCHING && (
                                    <button 
                                        onClick={() => initiateReject(WorkflowStage.RESEARCHING)}
                                        className="w-12 bg-red-900/50 border border-red-800 text-red-400 rounded-lg flex items-center justify-center hover:bg-red-900 hover:text-white transition-colors"
                                        title="Reject Market Research"
                                    >
                                        <XCircle className="w-5 h-5" />
                                    </button>
                                )}
                             </div>
                        </div>

                        {/* PHASE 2 */}
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleApproveResearchAndScript}
                                    disabled={loading || !project.marketAnalysis || (project.workflowStage !== WorkflowStage.RESEARCHING && project.workflowStage !== WorkflowStage.SCRIPTING)}
                                    className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-between text-sm font-medium border transition-all
                                        ${project.workflowStage === WorkflowStage.RESEARCHING ? 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}
                                    `}
                                >
                                    <span className="flex items-center gap-2"><BookOpen className="w-4 h-4"/> 2. Scripting</span>
                                    {project.panels.length > 0 && <CheckCircle className="w-4 h-4 text-green-500"/>}
                                </button>
                                {project.workflowStage === WorkflowStage.CENSORING_SCRIPT && (
                                    <button 
                                        onClick={() => initiateReject(WorkflowStage.CENSORING_SCRIPT)}
                                        className="w-12 bg-red-900/50 border border-red-800 text-red-400 rounded-lg flex items-center justify-center hover:bg-red-900 hover:text-white transition-colors"
                                        title="Reject Script"
                                    >
                                        <XCircle className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* PHASE 3 */}
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleApproveScriptAndVisualize}
                                    disabled={loading || !project.panels.length || project.isCensored || project.workflowStage === WorkflowStage.POST_PRODUCTION || project.workflowStage === WorkflowStage.COMPLETED}
                                    className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-between text-sm font-medium border transition-all
                                        ${project.workflowStage === WorkflowStage.CENSORING_SCRIPT ? 'bg-rose-600 border-rose-500 text-white hover:bg-rose-500 shadow-lg shadow-rose-900/20' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}
                                    `}
                                >
                                    <span className="flex items-center gap-2"><Palette className="w-4 h-4"/> 3. Visualization</span>
                                    {project.panels.some(p => p.imageUrl) && <CheckCircle className="w-4 h-4 text-green-500"/>}
                                </button>
                                {project.workflowStage === WorkflowStage.POST_PRODUCTION && (
                                    <button 
                                        onClick={() => initiateReject(WorkflowStage.POST_PRODUCTION)}
                                        className="w-12 bg-red-900/50 border border-red-800 text-red-400 rounded-lg flex items-center justify-center hover:bg-red-900 hover:text-white transition-colors"
                                        title="Reject Visuals"
                                    >
                                        <XCircle className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* PHASE 4 */}
                        <div className="space-y-2">
                             <div className="flex gap-2">
                                <button 
                                    onClick={handleFinalizeProduction}
                                    disabled={loading || !project.panels.some(p => p.imageUrl) || project.workflowStage === WorkflowStage.COMPLETED}
                                    className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-between text-sm font-medium border transition-all
                                        ${project.workflowStage === WorkflowStage.POST_PRODUCTION ? 'bg-amber-600 border-amber-500 text-white hover:bg-amber-500 shadow-lg shadow-amber-900/20' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}
                                    `}
                                >
                                    <span className="flex items-center gap-2"><Video className="w-4 h-4"/> 4. Post-Production</span>
                                    {project.workflowStage === WorkflowStage.COMPLETED && <CheckCircle className="w-4 h-4 text-green-500"/>}
                                </button>
                                {project.workflowStage === WorkflowStage.COMPLETED && (
                                    <button 
                                        onClick={() => initiateReject(WorkflowStage.COMPLETED)}
                                        className="w-12 bg-red-900/50 border border-red-800 text-red-400 rounded-lg flex items-center justify-center hover:bg-red-900 hover:text-white transition-colors"
                                        title="Reject Final Cut"
                                    >
                                        <XCircle className="w-5 h-5" />
                                    </button>
                                )}
                             </div>
                        </div>
                    </div>
                 </div>
            </div>

            {/* Middle: Collaboration Logs */}
            <div className="lg:col-span-2 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-zinc-800 bg-zinc-800/50 flex justify-between items-center">
                    <h3 className="font-bold text-zinc-200">Team Communication Log</h3>
                    {loading && <div className="flex items-center gap-2 text-xs text-blue-400"><Loader2 className="w-3 h-3 animate-spin"/> Agents working...</div>}
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/50">
                    {project.logs.length === 0 && <div className="text-zinc-600 text-center py-10 italic">System Idle. Start a task to see agent activity.</div>}
                    
                    {project.logs.map((log) => (
                        <div key={log.id} className="flex gap-3 animate-fade-in">
                            <img src={AGENTS[log.agentId].avatar} className={`w-8 h-8 rounded-full border border-zinc-700 shrink-0 ${AGENTS[log.agentId].color.replace('bg-', 'border-')}`} />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-zinc-300">{AGENTS[log.agentId].name}</span>
                                    <span className="text-[10px] text-zinc-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <div className={`text-sm p-3 rounded-lg rounded-tl-none inline-block max-w-full
                                    ${log.type === 'error' ? 'bg-red-900/20 text-red-200 border border-red-900/50' : 
                                      log.type === 'success' ? 'bg-green-900/20 text-green-200 border border-green-900/50' : 
                                      log.type === 'warning' ? 'bg-orange-900/20 text-orange-200 border border-orange-900/50' : 
                                      'bg-zinc-800 text-zinc-300'}
                                `}>
                                    {log.message}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={logsEndRef} />
                </div>
            </div>
        </div>
      </div>
    );
  }

  // --- MARKET RESEARCHER VIEW ---
  if (role === AgentRole.MARKET_RESEARCHER) {
      return (
          <div className="p-8 max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-8">
                  <img src={AGENTS[role].avatar} alt="Researcher" className="w-16 h-16 rounded-full border-2 border-indigo-500" />
                  <div>
                    <h2 className="text-2xl font-bold">Market Analysis</h2>
                    <p className="text-zinc-400">Trend spotting for "{project.theme || '...'}"</p>
                  </div>
              </div>
              <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 min-h-[300px] whitespace-pre-wrap leading-relaxed text-zinc-200 shadow-inner">
                  {project.marketAnalysis || <span className="text-zinc-600 italic">Analysis pending...</span>}
              </div>
          </div>
      );
  }

  // --- CENSOR VIEW ---
  if (role === AgentRole.CENSOR) {
      return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <img src={AGENTS[role].avatar} alt="Censor" className="w-16 h-16 rounded-full border-2 border-red-600" />
                <div>
                  <h2 className="text-2xl font-bold">Safety & Compliance</h2>
                  <p className="text-zinc-400">Content moderation logs.</p>
                </div>
            </div>
            
            <div className={`rounded-xl p-6 border mb-6 flex items-start gap-4 
                ${project.censorReport ? (project.isCensored ? 'bg-red-900/10 border-red-800' : 'bg-green-900/10 border-green-800') : 'bg-zinc-900 border-zinc-800'}
            `}>
                {project.censorReport ? (
                    project.isCensored ? <ShieldAlert className="w-8 h-8 text-red-500 shrink-0"/> : <CheckCircle className="w-8 h-8 text-green-500 shrink-0"/>
                ) : <Activity className="w-8 h-8 text-zinc-600 shrink-0"/>}
                
                <div>
                    <h3 className="font-bold text-lg mb-1">{project.censorReport ? (project.isCensored ? 'Violations Found' : 'Content Safe') : 'No Report'}</h3>
                    <p className="text-zinc-300">{project.censorReport || "Waiting for script..."}</p>
                </div>
            </div>
        </div>
      );
  }

  // --- GENERIC FALLBACK FOR VISUAL ROLES (Simpler view as Manager controls them now) ---
  if (role === AgentRole.SCRIPTWRITER) {
    return (
      <div className="h-full flex flex-col p-6 max-w-5xl mx-auto w-full">
         <div className="flex items-center gap-4 mb-6">
            <img src={AGENTS[role].avatar} alt="Writer" className="w-12 h-12 rounded-full border-2 border-emerald-500" />
            <div>
                <h2 className="text-xl font-bold">Script Generation</h2>
            </div>
         </div>
         {project.panels.length > 0 ? (
             <div className="space-y-4">
                 {project.panels.map((p, i) => (
                     <div key={i} className="bg-zinc-900 p-4 rounded border border-zinc-800">
                         <span className="text-emerald-500 font-mono text-xs font-bold">PANEL {i+1}</span>
                         <p className="mt-1 text-zinc-300">{p.description}</p>
                         <p className="mt-2 text-emerald-200 italic">"{p.dialogue}"</p>
                     </div>
                 ))}
             </div>
         ) : <div className="text-center text-zinc-500 py-20">Waiting for Director approval to start scripting...</div>}
      </div>
    );
  }
  
  // Re-use existing visual logic for manual overrides or detailed viewing
  if (role === AgentRole.CHARACTER_DESIGNER) {
       return (
        <div className="h-full flex flex-col p-6 max-w-6xl mx-auto w-full">
            <div className="flex items-center gap-4 mb-6">
                <img src={AGENTS[role].avatar} className="w-12 h-12 rounded-full border-2 border-purple-500" />
                <h2 className="text-xl font-bold">Character Design Output</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {project.characters.map((char) => (
                    <div key={char.id} className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 relative">
                        <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-zinc-300 flex items-center gap-1">
                            <Mic className="w-3 h-3" /> {char.voice}
                        </div>
                        <div className="aspect-square bg-black relative">
                            {char.imageUrl ? <img src={char.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-700"><Users/></div>}
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold">{char.name}</h3>
                            <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{char.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      );
  }

  if (role === AgentRole.PANEL_ARTIST) {
       return (
        <div className="h-full flex flex-col p-6 max-w-6xl mx-auto w-full">
            <div className="flex items-center gap-4 mb-6">
                <img src={AGENTS[role].avatar} className="w-12 h-12 rounded-full border-2 border-rose-500" />
                <h2 className="text-xl font-bold">Panel Art Output</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {project.panels.map((p, i) => (
                    <div key={i} className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
                        <div className="aspect-[4/3] bg-black relative">
                            {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-700"><ImageIcon/></div>}
                        </div>
                        <div className="p-2 text-xs text-center text-zinc-