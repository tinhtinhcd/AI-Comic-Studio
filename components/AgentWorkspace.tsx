
import React, { useState, useEffect, useRef } from 'react';
import { AgentRole, ComicProject, ComicPanel, Character, WorkflowStage, SystemLog, ResearchData, StoryFormat, StoryConcept, Message } from '../types';
import { AGENTS } from '../constants';
import * as GeminiService from '../services/geminiService';
import * as StorageService from '../services/storageService';
import { Send, RefreshCw, Image as ImageIcon, CheckCircle, Loader2, Sparkles, UserPlus, BookOpen, Users, Megaphone, Languages, Mic, Video, Play, Pause, Globe, TrendingUp, ShieldAlert, ArrowRight, Activity, Palette, XCircle, AlertTriangle, X, Edit2, Film, Save, Settings, Target, Lightbulb, PenTool, Layers, Archive, Trash2, FileText, Upload, Lock, Unlock, Book, ChevronRight, Eye, AlertCircle, Zap, Clock, Wand2, Search, ScanFace, MessageCircle } from 'lucide-react';

interface AgentWorkspaceProps {
  role: AgentRole;
  project: ComicProject;
  updateProject: (updates: Partial<ComicProject>) => void;
}

const AVAILABLE_VOICES = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
const NARRATOR_VOICE = 'Puck'; // Default narrator

const SUPPORTED_LANGUAGES = ['English', 'Vietnamese', 'Japanese', 'Korean', 'French', 'Spanish'];

const WORKFLOW_STEPS = [
    { id: WorkflowStage.RESEARCHING, label: '1. Strategy', icon: TrendingUp },
    { id: WorkflowStage.SCRIPTING, label: '2. Script', icon: BookOpen },
    { id: WorkflowStage.DESIGNING_CHARACTERS, label: '3. Casting', icon: Users },
    { id: WorkflowStage.VISUALIZING_PANELS, label: '4. Storyboard', icon: Palette },
    { id: WorkflowStage.POST_PRODUCTION, label: '5. Motion', icon: Video },
    { id: WorkflowStage.COMPLETED, label: '6. Publish', icon: CheckCircle },
];

const AgentWorkspace: React.FC<AgentWorkspaceProps> = ({ role, project, updateProject }) => {
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  
  // Scriptwriter Sub-states
  const [scriptStep, setScriptStep] = useState<'CONCEPT' | 'CASTING' | 'WRITING'>('CONCEPT');

  // Rejection State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectStage, setRejectStage] = useState<WorkflowStage | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Micro-correction State
  const [regeneratingPanelId, setRegeneratingPanelId] = useState<string | null>(null);

  // Archivist State
  const [library, setLibrary] = useState<ComicProject[]>([]);
  const [selectedArchivedProject, setSelectedArchivedProject] = useState<ComicProject | null>(null);

  // Market Researcher Chat State
  const [researchChatInput, setResearchChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll for logs
  const logsEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (role === AgentRole.PROJECT_MANAGER) {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    // Load library if Archivist
    if (role === AgentRole.ARCHIVIST) {
        setLibrary(StorageService.getLibrary());
    }
    // Auto set script step
    if (role === AgentRole.SCRIPTWRITER) {
        if (!project.storyConcept) setScriptStep('CONCEPT');
        else if (project.characters.length === 0) setScriptStep('CASTING');
        else if (project.panels.length === 0) setScriptStep('WRITING');
        else setScriptStep('WRITING');
    }
    // Scroll chat
    if (role === AgentRole.MARKET_RESEARCHER) {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

  }, [project.logs, role, project.storyConcept, project.characters.length, project.panels.length, project.researchChatHistory]);

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

  const isLongFormat = project.storyFormat === 'LONG_SERIES' || project.storyFormat === 'EPISODIC';

  // Helper to force key selection only for Paid tier
  const checkApiKeyRequirement = async () => {
    if (project.modelTier === 'PREMIUM' && (window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await (window as any).aistudio.openSelectKey();
        }
    }
  };

  const getStageOrder = (stage: WorkflowStage) => {
      const order = [
          WorkflowStage.IDLE,
          WorkflowStage.RESEARCHING,
          WorkflowStage.SCRIPTING,
          WorkflowStage.CENSORING_SCRIPT,
          WorkflowStage.DESIGNING_CHARACTERS,
          WorkflowStage.VISUALIZING_PANELS,
          WorkflowStage.POST_PRODUCTION,
          WorkflowStage.COMPLETED
      ];
      return order.indexOf(stage);
  };

  const renderProgressBar = () => {
    const currentOrder = getStageOrder(project.workflowStage);

    return (
      <div className="w-full bg-zinc-950/50 border-b border-zinc-800 p-4 mb-6 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center justify-between max-w-6xl mx-auto px-4">
          {WORKFLOW_STEPS.map((step, idx) => {
            const stepOrder = getStageOrder(step.id);
            const isCompleted = currentOrder > stepOrder;
            const isActive = currentOrder === stepOrder;
            
            let statusColor = 'text-zinc-600 bg-zinc-900 border-zinc-800';
            if (isActive) statusColor = 'text-white bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/20';
            else if (isCompleted) statusColor = 'text-indigo-400 bg-indigo-900/20 border-indigo-500/30';
            
            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none group">
                 <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold transition-all whitespace-nowrap ${statusColor}`}>
                     <step.icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                     <span className="hidden md:block">{step.label}</span>
                 </div>
                 {idx < WORKFLOW_STEPS.length - 1 && (
                     <div className={`h-0.5 w-full mx-2 rounded-full transition-all ${isCompleted ? 'bg-indigo-500/50' : 'bg-zinc-800'}`} />
                 )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ----------------------------------------------------------------------
  // REJECTION / CORRECTION LOGIC
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

      // Rollback logic
      switch (rejectStage) {
          case WorkflowStage.RESEARCHING:
              addLog(AgentRole.PROJECT_MANAGER, `REJECTED Market Research: "${reason}".`, 'error');
              updateProject({ workflowStage: WorkflowStage.IDLE, marketAnalysis: null });
              break;
          case WorkflowStage.CENSORING_SCRIPT:
              addLog(AgentRole.PROJECT_MANAGER, `REJECTED Script: "${reason}". Back to drafting.`, 'error');
              updateProject({ workflowStage: WorkflowStage.RESEARCHING });
              break;
          case WorkflowStage.POST_PRODUCTION:
              addLog(AgentRole.PROJECT_MANAGER, `REJECTED Visuals: "${reason}". Back to art.`, 'error');
              updateProject({ workflowStage: WorkflowStage.CENSORING_SCRIPT });
              break;
          case WorkflowStage.COMPLETED:
               addLog(AgentRole.PROJECT_MANAGER, `REJECTED Final Cut: "${reason}".`, 'error');
               updateProject({ workflowStage: WorkflowStage.POST_PRODUCTION });
               break;
          default: break;
      }
  };

  // ----------------------------------------------------------------------
  // AUTONOMOUS WORKFLOW CONTROLLERS
  // ----------------------------------------------------------------------

  // NEW: Interactive Research Chat
  const handleResearchChatSend = async () => {
      if (!researchChatInput.trim()) return;
      
      const userMsg: Message = { role: 'user', content: researchChatInput, timestamp: Date.now() };
      const newHistory = [...(project.researchChatHistory || []), userMsg];
      
      updateProject({ 
          researchChatHistory: newHistory,
          workflowStage: WorkflowStage.RESEARCHING // Ensure stage is active
      });
      setResearchChatInput('');
      setLoading(true);

      try {
          const aiResponseText = await GeminiService.sendResearchChatMessage(newHistory, researchChatInput, project.modelTier);
          const aiMsg: Message = { role: 'agent', content: aiResponseText, timestamp: Date.now() };
          updateProject({ researchChatHistory: [...newHistory, aiMsg] });
      } catch (e) {
          addLog(AgentRole.MARKET_RESEARCHER, "Chat failed to respond.", 'error');
      } finally {
          setLoading(false);
      }
  };

  const handleFinalizeStrategyFromChat = async () => {
      setLoading(true);
      addLog(AgentRole.MARKET_RESEARCHER, "Extracting strategy from conversation...", 'info');
      try {
          const analysis = await GeminiService.extractStrategyFromChat(project.researchChatHistory, project.language, project.modelTier);
          updateProject({ 
              marketAnalysis: analysis,
              title: analysis.suggestedTitle,
              style: analysis.visualStyle,
              theme: analysis.narrativeStructure + " " + analysis.keyThemes.join(", ") // Sync simple theme
          });
          addLog(AgentRole.MARKET_RESEARCHER, "Strategy Finalized from Chat.", 'success');
      } catch (e) {
          addLog(AgentRole.MARKET_RESEARCHER, "Failed to extract strategy.", 'error');
      } finally {
          setLoading(false);
      }
  };

  const handleUpdateMarketAnalysis = (field: keyof ResearchData, value: any) => {
      if (!project.marketAnalysis) return;
      updateProject({
          marketAnalysis: { ...project.marketAnalysis, [field]: value }
      });
  };

  // NEW: Scripting Phase 1 - Concept & Research
  const handleGenerateConcept = async () => {
      setLoading(true);
      updateProject({ workflowStage: WorkflowStage.SCRIPTING });
      addLog(AgentRole.SCRIPTWRITER, "Agent 1 (Researcher): Searching internet for inspiration & tropes...", 'info');
      
      try {
          const concept = await GeminiService.generateStoryConceptsWithSearch(
              project.theme,
              project.style,
              project.language,
              project.modelTier
          );
          updateProject({ storyConcept: concept });
          setScriptStep('CASTING');
          addLog(AgentRole.SCRIPTWRITER, `Concept Found: ${concept.uniqueTwist}`, 'success');
      } catch (e: any) {
          addLog(AgentRole.SCRIPTWRITER, `Research failed: ${e.message}`, 'error');
      } finally { setLoading(false); }
  };

  // NEW: Scripting Phase 2 - Cast Generation
  const handleGenerateCast = async () => {
      if (!project.storyConcept) return;
      setLoading(true);
      addLog(AgentRole.SCRIPTWRITER, "Agent 2 (Casting): Developing complex character profiles...", 'info');
      
      try {
          const complexChars = await GeminiService.generateComplexCharacters(
              project.storyConcept,
              project.language,
              project.modelTier
          );
          
          const charsWithVoice = complexChars.map(c => ({
              ...c,
              voice: AVAILABLE_VOICES[Math.floor(Math.random() * AVAILABLE_VOICES.length)]
          }));
          
          updateProject({ characters: charsWithVoice });
          setScriptStep('WRITING');
          addLog(AgentRole.SCRIPTWRITER, `Cast assembled: ${complexChars.length} characters ready.`, 'success');
      } catch (e: any) {
          addLog(AgentRole.SCRIPTWRITER, `Casting failed: ${e.message}`, 'error');
      } finally { setLoading(false); }
  };

  // NEW: Scripting Phase 3 - Final Script
  const handleGenerateFinalScript = async () => {
      setLoading(true);
      addLog(AgentRole.SCRIPTWRITER, "Agent 3 (Lead Writer): Synthesizing plot and dialogue...", 'info');

      try {
          if (isLongFormat && !project.seriesBible) {
              const bible = await GeminiService.generateSeriesBible(project.theme, project.style, project.language, project.modelTier);
              updateProject({ seriesBible: bible });
          }

          const result = await GeminiService.generateScript(
            project.theme, 
            project.marketAnalysis ? project.marketAnalysis.visualStyle : project.style,
            project.language,
            project.storyFormat,
            project.seriesBible,
            project.modelTier,
            project.storyConcept,
            project.characters
          );
          
          updateProject({ title: result.title, panels: result.panels, workflowStage: WorkflowStage.CENSORING_SCRIPT });
          addLog(AgentRole.SCRIPTWRITER, `Script Draft Complete. Manager review needed.`, 'success');
          
          const scriptText = result.panels.map(p => p.description + " " + p.dialogue).join(" ");
          const censorResult = await GeminiService.censorContent(scriptText, 'SCRIPT');
          updateProject({ isCensored: !censorResult.passed, censorReport: censorResult.report });

      } catch (e) {
           addLog(AgentRole.SCRIPTWRITER, "Script generation failed.", 'error');
      } finally { setLoading(false); }
  };

  const handleRegenerateSinglePanel = async (panel: ComicPanel, index: number) => {
      if (!project.style || project.characters.length === 0) return;
      
      await checkApiKeyRequirement();

      setRegeneratingPanelId(panel.id);
      addLog(AgentRole.PROJECT_MANAGER, `Requesting redraw for Panel ${index + 1}...`, 'info');
      
      try {
          const imageUrl = await GeminiService.generatePanelImage(panel, project.style, project.characters, project.modelTier);
          const newPanels = [...project.panels];
          newPanels[index] = { ...newPanels[index], imageUrl };
          updateProject({ panels: newPanels });
          addLog(AgentRole.PANEL_ARTIST, `Redrew Panel ${index + 1}.`, 'success');
      } catch (e) {
          addLog(AgentRole.PANEL_ARTIST, `Failed to redraw Panel ${index + 1}.`, 'error');
      } finally {
          setRegeneratingPanelId(null);
      }
  };
  
  const handleUpdateCharacterDescription = (index: number, value: string) => {
      const newChars = [...project.characters];
      newChars[index] = { ...newChars[index], description: value };
      updateProject({ characters: newChars });
  };

  const handleRegenerateSingleCharacter = async (char: Character, index: number) => {
      if (!project.style) return;
      await checkApiKeyRequirement();
      
      const newChars = [...project.characters];
      newChars[index] = { ...newChars[index], isGenerating: true };
      updateProject({ characters: newChars });
      addLog(AgentRole.PROJECT_MANAGER, `Requesting redraw for character: ${char.name}...`, 'info');

      try {
          const result = await GeminiService.generateCharacterDesign(
                char.name, 
                project.theme,
                project.style,
                project.language,
                isLongFormat,
                project.modelTier,
                char.description
            );
            
            const successChars = [...project.characters];
            successChars[index] = { 
                ...successChars[index], 
                description: result.description, 
                imageUrl: result.imageUrl,
                isGenerating: false,
                isLocked: isLongFormat ? true : false
            };
            updateProject({ characters: successChars });
            addLog(AgentRole.CHARACTER_DESIGNER, `Redesigned ${char.name}.`, 'success');

      } catch (e) {
            const failChars = [...project.characters];
            failChars[index] = { ...failChars[index], isGenerating: false };
            updateProject({ characters: failChars });
            addLog(AgentRole.CHARACTER_DESIGNER, `Failed to redesign ${char.name}.`, 'error');
      }
  };

  const handleVerifyConsistency = async (char: Character, index: number) => {
      if (!char.imageUrl) return;
      
      const newChars = [...project.characters];
      newChars[index] = { ...newChars[index], consistencyStatus: 'PENDING' };
      updateProject({ characters: newChars });
      addLog(AgentRole.CHARACTER_DESIGNER, `Verifying style consistency for ${char.name}...`, 'info');
      
      try {
          const report = await GeminiService.analyzeCharacterConsistency(
              char.imageUrl,
              project.style,
              char.name,
              project.modelTier
          );
          
          const finalChars = [...project.characters];
          finalChars[index] = {
              ...finalChars[index],
              consistencyStatus: report.isConsistent ? 'PASS' : 'FAIL',
              consistencyReport: report.critique
          };
          updateProject({ characters: finalChars });
          
          if (report.isConsistent) {
              addLog(AgentRole.CHARACTER_DESIGNER, `Style Check PASSED for ${char.name}.`, 'success');
          } else {
              addLog(AgentRole.CHARACTER_DESIGNER, `Style Check WARNING for ${char.name}: ${report.critique}`, 'warning');
          }
      } catch (e) {
          addLog(AgentRole.CHARACTER_DESIGNER, `Style check failed for ${char.name}.`, 'error');
           const finalChars = [...project.characters];
           finalChars[index] = { ...finalChars[index], consistencyStatus: undefined };
           updateProject({ characters: finalChars });
      }
  };

  const handleUpdatePanelText = (index: number, field: 'description' | 'dialogue' | 'caption', value: string) => {
      const newPanels = [...project.panels];
      newPanels[index] = { ...newPanels[index], [field]: value };
      updateProject({ panels: newPanels });
  };

  const toggleCharacterLock = (charId: string) => {
      const newChars = project.characters.map(c => {
          if (c.id === charId) return { ...c, isLocked: !c.isLocked };
          return c;
      });
      updateProject({ characters: newChars });
      const char = newChars.find(c => c.id === charId);
      addLog(AgentRole.CHARACTER_DESIGNER, `${char?.name} design ${char?.isLocked ? 'LOCKED' : 'UNLOCKED'}.`, 'info');
  };

  const handleCharacterUpload = async (e: React.ChangeEvent<HTMLInputElement>, charIndex: number) => {
      const file = e.target.files?.[0];
      if (!file) return;
      await checkApiKeyRequirement();
      const reader = new FileReader();
      reader.onloadend = async () => {
          const base64 = reader.result as string;
          const newChars = [...project.characters];
          const charName = newChars[charIndex].name;
          newChars[charIndex] = {
              ...newChars[charIndex],
              imageUrl: base64,
              isGenerating: false,
              consistencyStatus: 'PENDING',
              isLocked: true 
          };
          updateProject({ characters: newChars });
          addLog(AgentRole.CHARACTER_DESIGNER, `Uploaded manual design for ${charName}. Verifying style consistency...`, 'info');
          try {
             const report = await GeminiService.analyzeCharacterConsistency(base64, project.style, charName, project.modelTier);
             const verifiedChars = [...project.characters]; 
             verifiedChars[charIndex] = {
                 ...verifiedChars[charIndex], 
                 consistencyStatus: report.isConsistent ? 'PASS' : 'FAIL',
                 consistencyReport: report.critique
             };
             updateProject({ characters: verifiedChars });
             if(report.isConsistent) {
                 addLog(AgentRole.CHARACTER_DESIGNER, `Style Check Passed for ${charName}.`, 'success');
             } else {
                 addLog(AgentRole.CHARACTER_DESIGNER, `Style Warning for ${charName}: ${report.critique}`, 'warning');
             }
          } catch (err) {
              addLog(AgentRole.CHARACTER_DESIGNER, `Verification failed for ${charName}.`, 'error');
          }
      };
      reader.readAsDataURL(file);
  };

  const handleArchiveProject = () => {
      StorageService.saveProjectToLibrary(project);
      addLog(AgentRole.PUBLISHER, "Project text & script archived to library.", 'success');
      alert("Project Saved! (Media stripped to save space)");
  };

  const handleDeleteFromLibrary = (id: string) => {
      if (confirm("Permanently delete this story from archive?")) {
          StorageService.deleteProjectFromLibrary(id);
          setLibrary(StorageService.getLibrary());
          if (selectedArchivedProject?.id === id) setSelectedArchivedProject(null);
      }
  };

  const handleLoadProject = (p: ComicProject) => {
      if (confirm("Load this project? Current unsaved workspace progress will be lost.")) {
          updateProject({
              ...p,
              logs: [...project.logs, {
                  id: crypto.randomUUID(),
                  agentId: AgentRole.ARCHIVIST,
                  message: `Loaded project "${p.title}" from archive. Media assets must be regenerated.`,
                  timestamp: Date.now(),
                  type: 'info'
              }]
          });
          addLog(AgentRole.PROJECT_MANAGER, `Project "${p.title}" loaded. Ready for visual production.`, 'info');
      }
  };

  const handleApproveResearchAndScript = async () => {
      await handleGenerateConcept();
  };

  const handleApproveScriptAndVisualize = async () => {
    if (project.isCensored) { alert("Script unsafe."); return; }
    if (isLongFormat) {
        const unlockedChars = project.characters.filter(c => !c.isLocked);
        if (unlockedChars.length > 0) {
            if(!confirm(`Warning: ${unlockedChars.length} characters are not LOCKED. In Long Series, you should finalize designs first to ensure consistency. Continue anyway?`)) {
                return;
            }
        }
    }
    setLoading(true);
    updateProject({ workflowStage: WorkflowStage.DESIGNING_CHARACTERS });
    addLog(AgentRole.PROJECT_MANAGER, `Script Approved. Starting Visuals.`, 'info');
    await checkApiKeyRequirement();
    try {
        addLog(AgentRole.CHARACTER_DESIGNER, `Designing ${project.characters.length} characters...`, 'info');
        let updatedChars = [...project.characters];
        for (let i = 0; i < updatedChars.length; i++) {
             if (updatedChars[i].isLocked && updatedChars[i].imageUrl) { continue; }
             updatedChars[i] = { ...updatedChars[i], isGenerating: true };
             updateProject({ characters: [...updatedChars] });
             try {
                const result = await GeminiService.generateCharacterDesign(
                    updatedChars[i].name, 
                    project.theme,
                    project.style,
                    project.language,
                    isLongFormat,
                    project.modelTier,
                    updatedChars[i].description
                );
                updatedChars[i] = { 
                    ...updatedChars[i], 
                    description: result.description, 
                    imageUrl: result.imageUrl,
                    isLocked: isLongFormat ? true : false,
                    isGenerating: false
                };
             } catch (error) {
                 updatedChars[i] = { ...updatedChars[i], isGenerating: false };
                 addLog(AgentRole.CHARACTER_DESIGNER, `Failed to generate ${updatedChars[i].name}`, 'error');
             }
             updateProject({ characters: [...updatedChars] }); 
        }
        updateProject({ workflowStage: WorkflowStage.VISUALIZING_PANELS });
        addLog(AgentRole.PANEL_ARTIST, `Drawing ${project.panels.length} panels...`, 'info');
        let updatedPanels = [...project.panels];
        for (let i = 0; i < updatedPanels.length; i++) {
             if (!updatedPanels[i].imageUrl) {
                 updatedPanels[i] = { ...updatedPanels[i], isGenerating: true };
                 updateProject({ panels: [...updatedPanels] });
                 try {
                     const imageUrl = await GeminiService.generatePanelImage(updatedPanels[i], project.style, updatedChars, project.modelTier);
                     updatedPanels[i] = { ...updatedPanels[i], imageUrl, isGenerating: false };
                 } catch (error) {
                     updatedPanels[i] = { ...updatedPanels[i], isGenerating: false };
                     addLog(AgentRole.PANEL_ARTIST, `Failed to draw Panel ${i+1}`, 'error');
                 }
                 updateProject({ panels: [...updatedPanels] });
             }
        }
        updateProject({ workflowStage: WorkflowStage.POST_PRODUCTION });
        addLog(AgentRole.PANEL_ARTIST, "Visuals ready for review/corrections.", 'success');
    } catch (e) {
        addLog(AgentRole.PROJECT_MANAGER, "Visual production error.", 'error');
    } finally { setLoading(false); }
  };

  const handleFinalizeProduction = async () => {
    setLoading(true);
    addLog(AgentRole.PROJECT_MANAGER, "Greenlighting Motion & Sound.", 'info');
    const hasVideoRequest = project.panels.some(p => p.shouldAnimate && !p.videoUrl);
    if (hasVideoRequest && (window as any).aistudio) {
        try {
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            if (!hasKey) { await (window as any).aistudio.openSelectKey(); }
        } catch (e) { }
    }
    try {
        const newPanels = [...project.panels];
        addLog(AgentRole.VOICE_ACTOR, "Recording audio...", 'info');
        for (let i = 0; i < newPanels.length; i++) {
            if (newPanels[i].dialogue && !newPanels[i].audioUrl) {
                 try {
                     const speakerName = newPanels[i].charactersInvolved[0];
                     const speaker = project.characters.find(c => c.name === speakerName);
                     const audioUrl = await GeminiService.generateVoiceover(newPanels[i].dialogue, speaker?.voice || 'Puck');
                     newPanels[i].audioUrl = audioUrl;
                 } catch (err) {}
            }
            if (newPanels[i].caption && !newPanels[i].captionAudioUrl) {
                try {
                    const captionUrl = await GeminiService.generateVoiceover(newPanels[i].caption!, NARRATOR_VOICE);
                    newPanels[i].captionAudioUrl = captionUrl;
                } catch (err) {}
            }
        }
        updateProject({ panels: [...newPanels] });
        if (hasVideoRequest) {
            addLog(AgentRole.CINEMATOGRAPHER, "Animating selected panels...", 'info');
            for (let i = 0; i < newPanels.length; i++) {
                if (newPanels[i].imageUrl && newPanels[i].shouldAnimate && !newPanels[i].videoUrl) {
                    try {
                        const durationPrompt = newPanels[i].duration ? ` slow ambient motion, duration ${newPanels[i].duration} seconds` : '';
                        const videoUrl = await GeminiService.generateVideo(newPanels[i].imageUrl!, newPanels[i].description + durationPrompt);
                        newPanels[i] = { ...newPanels[i], videoUrl };
                        updateProject({ panels: [...newPanels] });
                    } catch (err: any) {
                         addLog(AgentRole.CINEMATOGRAPHER, `Video skipped Panel ${i+1}: ${err.message}`, 'error');
                    }
                }
            }
            updateProject({ panels: [...newPanels] });
        }
        updateProject({ workflowStage: WorkflowStage.COMPLETED });
        addLog(AgentRole.PUBLISHER, "Motion Comic Production Complete.", 'success');
    } catch (e) {
        addLog(AgentRole.PROJECT_MANAGER, "Production error.", 'error');
    } finally { setLoading(false); }
  };

  // --- MARKET RESEARCHER: NEW CHAT INTERFACE ---
  if (role === AgentRole.MARKET_RESEARCHER) {
      return (
        <div className="h-full flex flex-col w-full relative overflow-y-auto">
            {renderProgressBar()}
            <div className="max-w-7xl mx-auto w-full px-6 pb-8 h-[80vh]"> {/* Fixed height container */}
                <div className="flex items-center gap-6 mb-4 shrink-0">
                    <img src={AGENTS[role].avatar} className="w-12 h-12 rounded-full border-2 border-indigo-500 shadow-lg" />
                    <div>
                        <h2 className="text-2xl font-bold text-white">Strategic Planner</h2>
                        <p className="text-zinc-400 text-sm">Chat to define your story's length, world, and audience.</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 h-full pb-10">
                    {/* LEFT: CHAT */}
                    <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden">
                        <div className="p-3 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
                            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Brainstorming Session</span>
                            <button onClick={handleFinalizeStrategyFromChat} disabled={loading || project.researchChatHistory.length < 2} className="text-[10px] bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded text-white font-bold transition-colors disabled:opacity-50">
                                {loading ? 'Extracting...' : 'Finalize Strategy'}
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {project.researchChatHistory?.length === 0 && (
                                <div className="text-center text-zinc-600 mt-10">
                                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50"/>
                                    <p className="text-sm">Say "Hello" to start planning your story.</p>
                                    <p className="text-xs mt-2">Tip: Specify chapter count (e.g., "I want 20 chapters").</p>
                                </div>
                            )}
                            {project.researchChatHistory?.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-xl p-3 text-sm ${msg.role === 'user' ? 'bg-indigo-900/50 text-white rounded-br-none' : 'bg-zinc-800 text-zinc-200 rounded-bl-none'}`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="p-4 bg-zinc-950 border-t border-zinc-800">
                            <div className="flex gap-2">
                                <input 
                                    value={researchChatInput}
                                    onChange={(e) => setResearchChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleResearchChatSend()}
                                    placeholder="Discuss your story idea..."
                                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none"
                                />
                                <button 
                                    onClick={handleResearchChatSend}
                                    disabled={loading || !researchChatInput.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin w-5 h-5"/> : <Send className="w-5 h-5"/>}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: STRATEGY FORM (EDITABLE) */}
                    <div className="w-full lg:w-1/3 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden">
                        <div className="p-3 border-b border-zinc-800 bg-zinc-950/50">
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Draft Strategy</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {!project.marketAnalysis ? (
                                <div className="h-full flex items-center justify-center text-zinc-600 text-xs italic">
                                    Chat with the planner to generate this data.
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-zinc-500">Title Idea</label>
                                        <input 
                                            value={project.marketAnalysis.suggestedTitle}
                                            onChange={(e) => handleUpdateMarketAnalysis('suggestedTitle', e.target.value)}
                                            className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-xs text-white mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-zinc-500">Target Audience</label>
                                        <input 
                                            value={project.marketAnalysis.targetAudience}
                                            onChange={(e) => handleUpdateMarketAnalysis('targetAudience', e.target.value)}
                                            className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-xs text-white mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-amber-500">Length / Structure</label>
                                        <input 
                                            value={project.marketAnalysis.estimatedChapters || ''}
                                            onChange={(e) => handleUpdateMarketAnalysis('estimatedChapters', e.target.value)}
                                            placeholder="e.g. 12 Chapters, 3 Seasons"
                                            className="w-full bg-zinc-800 border border-amber-500/30 rounded p-2 text-xs text-amber-100 mt-1 font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-pink-500">Visual Style</label>
                                        <textarea 
                                            value={project.marketAnalysis.visualStyle}
                                            onChange={(e) => handleUpdateMarketAnalysis('visualStyle', e.target.value)}
                                            className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-xs text-white mt-1 h-20 resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-cyan-500">World Setting</label>
                                        <textarea 
                                            value={project.marketAnalysis.worldSetting}
                                            onChange={(e) => handleUpdateMarketAnalysis('worldSetting', e.target.value)}
                                            className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-xs text-white mt-1 h-20 resize-none"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // --- SCRIPTWRITER & CENSOR & TRANSLATOR (WRITERS' ROOM) ---
  if ([AgentRole.SCRIPTWRITER, AgentRole.CENSOR, AgentRole.TRANSLATOR].includes(role)) {
      return (
      <div className="h-full flex flex-col w-full relative overflow-y-auto">
         {renderProgressBar()}
         <div className="max-w-6xl mx-auto w-full px-8 pb-8">
             <div className="flex items-center gap-6 mb-8">
                <img src={AGENTS[role].avatar} className="w-16 h-16 rounded-full border-2 border-emerald-500 shadow-lg" />
                <div>
                    <h2 className="text-2xl font-bold text-white">The Writers' Room</h2>
                    <p className="text-zinc-400">Collaborative scripting with Research, Character, and Narrative Agents.</p>
                </div>
             </div>

             {/* Workflow Stepper */}
             <div className="grid grid-cols-3 gap-4 mb-8">
                 <button 
                    disabled
                    className={`p-4 rounded-xl border flex flex-col gap-2 transition-all ${scriptStep === 'CONCEPT' || project.storyConcept ? 'bg-indigo-900/30 border-indigo-500 text-indigo-100' : 'bg-zinc-900 border-zinc-800 text-zinc-500 opacity-50'}`}
                 >
                     <Search className="w-6 h-6 mb-1"/>
                     <span className="font-bold text-sm">1. Research</span>
                 </button>
                 <button 
                    disabled
                    className={`p-4 rounded-xl border flex flex-col gap-2 transition-all ${scriptStep === 'CASTING' || project.characters.length > 0 ? 'bg-purple-900/30 border-purple-500 text-purple-100' : 'bg-zinc-900 border-zinc-800 text-zinc-500 opacity-50'}`}
                 >
                     <Users className="w-6 h-6 mb-1"/>
                     <span className="font-bold text-sm">2. Casting</span>
                 </button>
                 <button 
                    disabled
                    className={`p-4 rounded-xl border flex flex-col gap-2 transition-all ${scriptStep === 'WRITING' || project.panels.length > 0 ? 'bg-emerald-900/30 border-emerald-500 text-emerald-100' : 'bg-zinc-900 border-zinc-800 text-zinc-500 opacity-50'}`}
                 >
                     <Edit2 className="w-6 h-6 mb-1"/>
                     <span className="font-bold text-sm">3. Screenplay</span>
                 </button>
             </div>

             {/* STAGE 1: CONCEPT */}
             {scriptStep === 'CONCEPT' && !project.storyConcept && (
                 <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 text-center">
                     <Search className="w-12 h-12 text-indigo-500 mx-auto mb-4"/>
                     <h3 className="text-xl font-bold text-white mb-2">Inspiration & Grounding</h3>
                     <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                         The Research Agent will scan the internet for trending tropes and classic stories in the "{project.theme}" genre, then propose a unique twist.
                     </p>
                     <button 
                        onClick={handleGenerateConcept}
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto"
                     >
                         {loading ? <Loader2 className="animate-spin"/> : <Sparkles className="w-5 h-5"/>}
                         Start Research Agent
                     </button>
                 </div>
             )}

             {/* STAGE 1 RESULT: CONCEPT DISPLAY */}
             {project.storyConcept && (
                 <div className="bg-indigo-900/20 border border-indigo-500/30 p-6 rounded-2xl mb-8">
                     <h3 className="text-indigo-400 font-bold mb-4 flex items-center gap-2"><Lightbulb className="w-5 h-5"/> Story Concept (Research Data)</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                             <label className="text-[10px] uppercase font-bold text-indigo-500 mb-1 block">Premise</label>
                             <p className="text-sm text-indigo-100/90 leading-relaxed">{project.storyConcept.premise}</p>
                         </div>
                         <div>
                             <label className="text-[10px] uppercase font-bold text-pink-500 mb-1 block">Unique Twist</label>
                             <p className="text-sm text-pink-100/90 leading-relaxed font-bold">{project.storyConcept.uniqueTwist}</p>
                         </div>
                         <div className="col-span-full">
                             <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block">Inspirations (Google Search)</label>
                             <div className="flex gap-2 flex-wrap">
                                 {project.storyConcept.similarStories?.map((s, i) => (
                                     <span key={i} className="text-xs bg-zinc-900 px-2 py-1 rounded text-zinc-400 border border-zinc-700">{s}</span>
                                 ))}
                             </div>
                         </div>
                     </div>
                 </div>
             )}

             {/* STAGE 2: CASTING */}
             {scriptStep === 'CASTING' && project.characters.length === 0 && (
                 <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 text-center">
                     <Users className="w-12 h-12 text-purple-500 mx-auto mb-4"/>
                     <h3 className="text-xl font-bold text-white mb-2">Character Development</h3>
                     <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                         The Casting Agent will create deep psychological profiles and distinct visuals for the cast based on the concept.
                     </p>
                     <button 
                        onClick={handleGenerateCast}
                        disabled={loading}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto"
                     >
                         {loading ? <Loader2 className="animate-spin"/> : <UserPlus className="w-5 h-5"/>}
                         Assemble Cast
                     </button>
                 </div>
             )}

             {/* STAGE 2 RESULT: CAST DISPLAY */}
             {project.characters.length > 0 && (
                  <div className="mb-8">
                      <h3 className="font-bold text-zinc-400 mb-2">Cast List</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {project.characters.map(c => (
                              <div key={c.id} className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg">
                                  <div className="flex justify-between items-start">
                                      <span className="font-bold text-white">{c.name}</span>
                                      <span className="text-[10px] bg-zinc-800 px-1 rounded text-zinc-400">{c.role}</span>
                                  </div>
                                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{c.personality}</p>
                              </div>
                          ))}
                      </div>
                  </div>
             )}

             {/* STAGE 3: WRITING */}
             {scriptStep === 'WRITING' && project.panels.length === 0 && (
                 <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 text-center">
                     <Edit2 className="w-12 h-12 text-emerald-500 mx-auto mb-4"/>
                     <h3 className="text-xl font-bold text-white mb-2">Screenplay Generation</h3>
                     <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                         The Lead Writer will now synthesize the Concept and Characters into a full script with dialogue and pacing.
                     </p>
                     <button 
                        onClick={handleGenerateFinalScript}
                        disabled={loading}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto"
                     >
                         {loading ? <Loader2 className="animate-spin"/> : <PenTool className="w-5 h-5"/>}
                         Write Script
                     </button>
                 </div>
             )}

             {/* FINAL SCRIPT EDITOR */}
             {project.panels.length > 0 && (
                 <div className="space-y-8 pb-24 animate-fade-in">
                     {project.panels.map((p, i) => (
                     <div key={i} className="bg-zinc-900/80 backdrop-blur-sm p-6 rounded-2xl border border-zinc-800 relative group shadow-lg transition-all hover:border-emerald-500/30">
                         <span className="absolute top-4 right-4 text-zinc-500 font-mono text-xs font-bold tracking-widest bg-zinc-950 px-2 py-1 rounded">SCENE {i+1}</span>
                         <div className="space-y-6 mt-2">
                             <div>
                                 <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-2 block">Visual Description</label>
                                 <textarea 
                                    value={p.description}
                                    onChange={(e) => handleUpdatePanelText(i, 'description', e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-zinc-200 text-sm focus:border-emerald-500 outline-none transition-colors"
                                    rows={2}
                                 />
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider mb-2 block flex items-center gap-2"><MessageSquare className="w-3 h-3"/> Dialogue</label>
                                    <textarea 
                                        value={p.dialogue}
                                        onChange={(e) => handleUpdatePanelText(i, 'dialogue', e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-emerald-100 text-sm focus:border-emerald-500 outline-none transition-colors"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-amber-500 tracking-wider mb-2 block flex items-center gap-2"><BookOpen className="w-3 h-3"/> Narrator</label>
                                    <textarea 
                                        value={p.caption || ''}
                                        onChange={(e) => handleUpdatePanelText(i, 'caption', e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-amber-100 text-sm focus:border-amber-500 outline-none transition-colors"
                                        rows={3}
                                        placeholder="(Optional narrator text)"
                                    />
                                </div>
                             </div>
                         </div>
                     </div>
                 ))}
                 </div>
             )}
         </div>
      </div>
    );
  }

  // --- CHARACTER DESIGNER (VISUAL ARTS DEPT) ---
  if (role === AgentRole.CHARACTER_DESIGNER) {
    return (
      <div className="h-full flex flex-col w-full relative overflow-y-auto">
        {renderProgressBar()}
        
        <div className="max-w-7xl mx-auto w-full px-6 pb-8">
            <div className="flex items-center gap-6 mb-8">
                <img src={AGENTS[role].avatar} className="w-16 h-16 rounded-full border-2 border-purple-500 shadow-lg" />
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Visual Arts Dept</h2>
                    <p className="text-zinc-400">Section 1: Character Design & Casting</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-24">
                {project.characters.length === 0 && (
                    <div className="col-span-full text-center py-20 text-zinc-500 border-2 border-dashed border-zinc-800 rounded-2xl">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50"/>
                        <p>No characters found. Run "Scripting" phase first to generate cast list.</p>
                    </div>
                )}
                
                {project.characters.map((char, idx) => (
                    <div key={char.id} className={`bg-zinc-900 border rounded-2xl overflow-hidden shadow-xl transition-all group ${char.isLocked ? 'border-green-500/50' : 'border-zinc-800 hover:border-purple-500'}`}>
                        {/* Image Area */}
                        <div className="aspect-square bg-zinc-950 relative flex items-center justify-center group-inner">
                            {char.isGenerating ? (
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="w-8 h-8 animate-spin text-purple-500"/>
                                    <span className="text-xs text-purple-400 animate-pulse">Designing...</span>
                                </div>
                            ) : char.imageUrl ? (
                                <img src={char.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"/>
                            ) : (
                                <div className="text-center p-4">
                                    <UserPlus className="w-8 h-8 mx-auto mb-2 text-zinc-700"/>
                                    <p className="text-xs text-zinc-500">Waiting for generation</p>
                                </div>
                            )}

                            {/* Verification Badge */}
                            {char.imageUrl && (
                                <div className="absolute top-3 left-3 flex flex-col gap-2">
                                    {char.consistencyStatus === 'PASS' && (
                                        <span className="bg-green-500/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3"/> Style Verified
                                        </span>
                                    )}
                                    {char.consistencyStatus === 'FAIL' && (
                                        <span className="bg-red-500/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1 group/fail cursor-help">
                                            <AlertTriangle className="w-3 h-3"/> Style Mismatch
                                            <div className="hidden group-hover/fail:block absolute top-full mt-1 left-0 bg-zinc-950 text-white text-xs p-2 rounded border border-red-500 w-48 z-10 shadow-xl">
                                                {char.consistencyReport}
                                            </div>
                                        </span>
                                    )}
                                </div>
                            )}
                            
                            {/* Actions Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                                <button 
                                    onClick={() => handleRegenerateSingleCharacter(char, idx)}
                                    disabled={char.isLocked}
                                    className={`p-3 rounded-full bg-white text-black hover:bg-purple-100 transition-colors ${char.isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title="Regenerate"
                                >
                                    <RefreshCw className="w-5 h-5"/>
                                </button>
                                
                                {/* Verify Style Button */}
                                {char.imageUrl && (
                                    <button 
                                        onClick={() => handleVerifyConsistency(char, idx)}
                                        className={`p-3 rounded-full bg-blue-500 text-white hover:bg-blue-400 transition-colors`}
                                        title="Verify Style Consistency"
                                    >
                                        <ScanFace className="w-5 h-5"/>
                                    </button>
                                )}

                                <label className="p-3 rounded-full bg-zinc-800 text-white hover:bg-zinc-700 cursor-pointer transition-colors" title="Upload Custom">
                                    <Upload className="w-5 h-5"/>
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCharacterUpload(e, idx)} />
                                </label>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        {char.name}
                                        {char.isLocked && <Lock className="w-3 h-3 text-green-500"/>}
                                    </h3>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{char.role}</span>
                                </div>
                                <button onClick={() => toggleCharacterLock(char.id)} className="text-zinc-600 hover:text-white transition-colors">
                                    {char.isLocked ? <Lock className="w-4 h-4"/> : <Unlock className="w-4 h-4"/>}
                                </button>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-zinc-600 uppercase">Visual Prompt</label>
                                <textarea 
                                    value={char.description}
                                    onChange={(e) => handleUpdateCharacterDescription(idx, e.target.value)}
                                    disabled={char.isLocked}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-zinc-300 mt-1 min-h-[60px] focus:border-purple-500 outline-none resize-none"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
  }

  // --- PANEL ARTIST (VISUAL ARTS DEPT) ---
  if (role === AgentRole.PANEL_ARTIST) {
    return (
        <div className="h-full flex flex-col w-full relative overflow-y-auto">
        {renderProgressBar()}
        
        <div className="max-w-7xl mx-auto w-full px-6 pb-8">
            <div className="flex items-center gap-6 mb-8">
                <img src={AGENTS[role].avatar} className="w-16 h-16 rounded-full border-2 border-rose-500 shadow-lg" />
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Visual Arts Dept</h2>
                    <p className="text-zinc-400">Section 2: Storyboards & Final Renders</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
                {project.panels.length === 0 && (
                    <div className="col-span-full text-center py-20 text-zinc-500 border-2 border-dashed border-zinc-800 rounded-2xl">
                        <Palette className="w-12 h-12 mx-auto mb-4 opacity-50"/>
                        <p>No panels found. Run "Scripting" phase first.</p>
                    </div>
                )}
                
                {project.panels.map((panel, idx) => (
                    <div key={panel.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group">
                        <div className="aspect-video bg-zinc-950 relative flex items-center justify-center">
                            {regeneratingPanelId === panel.id || panel.isGenerating ? (
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="w-8 h-8 animate-spin text-rose-500"/>
                                    <span className="text-xs text-rose-400 animate-pulse">Rendering...</span>
                                </div>
                            ) : panel.imageUrl ? (
                                <img src={panel.imageUrl} className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center p-4">
                                    <Palette className="w-8 h-8 mx-auto mb-2 text-zinc-700"/>
                                    <p className="text-xs text-zinc-500">Waiting for render</p>
                                </div>
                            )}

                             {/* Actions Overlay */}
                             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                                <button 
                                    onClick={() => handleRegenerateSinglePanel(panel, idx)}
                                    className="p-3 rounded-full bg-white text-black hover:bg-rose-100 transition-colors"
                                    title="Redraw Panel"
                                >
                                    <RefreshCw className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <h4 className="font-bold text-white text-sm mb-2">Panel #{idx + 1}</h4>
                            <p className="text-xs text-zinc-400 line-clamp-3">{panel.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        </div>
    );
  }

  // --- ARCHIVIST ---
  if (role === AgentRole.ARCHIVIST) {
    return (
        <div className="h-full flex flex-col w-full relative overflow-y-auto">
             {renderProgressBar()}
             <div className="max-w-7xl mx-auto w-full px-8 pb-8">
                 <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-6">
                        <img src={AGENTS[role].avatar} className="w-16 h-16 rounded-full border-2 border-stone-500 shadow-lg" />
                        <div>
                            <h2 className="text-2xl font-bold text-white">Project Archives</h2>
                            <p className="text-zinc-400">Secure textual storage for scripts and metadata.</p>
                        </div>
                    </div>
                    <div className="text-sm text-zinc-500">
                        Total Stored: {library.length}
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {library.map((p) => (
                        <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-stone-500 transition-all group flex flex-col h-64 relative">
                             <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-stone-500/20 rounded-lg text-stone-400 group-hover:bg-stone-500 group-hover:text-white transition-colors">
                                    <Archive className="w-6 h-6"/>
                                </div>
                                <span className="text-[10px] uppercase font-bold text-zinc-600 border border-zinc-800 px-2 py-1 rounded">
                                    {p.language}
                                </span>
                             </div>
                             <h3 className="font-bold text-lg text-white mb-1 line-clamp-1">{p.title}</h3>
                             <p className="text-xs text-zinc-500 mb-4">{new Date(p.lastModified || Date.now()).toLocaleDateString()}</p>
                             <p className="text-sm text-zinc-400 line-clamp-3 mb-6 flex-1">
                                {p.theme}
                             </p>
                             
                             <div className="flex gap-2 mt-auto">
                                 <button 
                                    onClick={() => setSelectedArchivedProject(p)}
                                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                 >
                                    <FileText className="w-4 h-4"/> View
                                 </button>
                                 <button 
                                    onClick={() => handleLoadProject(p)}
                                    className="flex-1 bg-stone-700 hover:bg-stone-600 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                 >
                                    <Upload className="w-4 h-4"/> Load
                                 </button>
                                 <button 
                                    onClick={() => handleDeleteFromLibrary(p.id!)}
                                    className="px-3 bg-red-900/20 hover:bg-red-900/50 text-red-500 rounded-lg transition-colors"
                                 >
                                    <Trash2 className="w-4 h-4"/>
                                 </button>
                             </div>
                        </div>
                    ))}
                    {library.length === 0 && (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-zinc-600 border-2 border-dashed border-zinc-800 rounded-3xl">
                            <Archive className="w-12 h-12 mb-4 opacity-50"/>
                            <p>No archived projects found.</p>
                            <p className="text-xs">Go to Publisher to archive a completed script.</p>
                        </div>
                    )}
                 </div>

                 {/* Detail Modal */}
                 {selectedArchivedProject && (
                     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                         <div className="bg-zinc-900 w-full max-w-2xl max-h-[80vh] rounded-2xl border border-zinc-700 shadow-2xl flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
                                <h3 className="font-bold text-white">{selectedArchivedProject.title} (Read-Only)</h3>
                                <button onClick={() => setSelectedArchivedProject(null)}><X className="w-5 h-5 text-zinc-500 hover:text-white"/></button>
                            </div>
                            <div className="p-6 overflow-y-auto space-y-6">
                                <div>
                                    <h4 className="text-xs font-bold uppercase text-stone-500 mb-2">Theme & Style</h4>
                                    <p className="text-zinc-300 text-sm">{selectedArchivedProject.theme}</p>
                                    <p className="text-zinc-400 text-xs mt-1">Style: {selectedArchivedProject.style} | Format: {selectedArchivedProject.storyFormat}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold uppercase text-stone-500 mb-2">Characters</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {selectedArchivedProject.characters.map(c => (
                                            <div key={c.id} className="bg-zinc-950 p-2 rounded border border-zinc-800">
                                                <p className="font-bold text-xs text-stone-300">{c.name}</p>
                                                <p className="text-[10px] text-zinc-500 line-clamp-2">{c.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold uppercase text-stone-500 mb-2">Script Summary</h4>
                                    <div className="space-y-2">
                                        {selectedArchivedProject.panels.map((p, idx) => (
                                            <div key={idx} className="flex gap-4 p-2 bg-zinc-950/50 rounded border border-zinc-800/50">
                                                <span className="text-stone-500 font-mono text-xs shrink-0">#{idx+1}</span>
                                                <div>
                                                    <p className="text-xs text-zinc-300 mb-1">{p.description}</p>
                                                    {p.dialogue && <p className="text-xs text-indigo-400 italic">"{p.dialogue}"</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-end">
                                <button onClick={() => { handleLoadProject(selectedArchivedProject); setSelectedArchivedProject(null); }} className="bg-stone-700 hover:bg-stone-600 text-white px-4 py-2 rounded-lg text-sm">
                                    Load Project
                                </button>
                            </div>
                         </div>
                     </div>
                 )}
             </div>
        </div>
    );
  }

  // --- PRODUCTION STUDIO AGENTS (VOICE, VIDEO, PUBLISHER) ---
  if ([AgentRole.VOICE_ACTOR, AgentRole.CINEMATOGRAPHER, AgentRole.PUBLISHER].includes(role)) {
    return (
        <div className="h-full flex flex-col w-full relative overflow-y-auto">
        {renderProgressBar()}
        
        <div className="max-w-7xl mx-auto w-full px-6 pb-8">
            <div className="flex items-center gap-6 mb-8">
                <img src={AGENTS[role].avatar} className="w-16 h-16 rounded-full border-2 border-amber-500 shadow-lg" />
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Production Studio</h2>
                    <p className="text-zinc-400">Post-Production: Motion, Audio & Distribution</p>
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl">Asset Management</h3>
                    {project.workflowStage === WorkflowStage.POST_PRODUCTION && (
                        <button 
                            onClick={handleFinalizeProduction} 
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin"/> : <Film className="w-5 h-5"/>}
                            Process All Media
                        </button>
                    )}
                    {project.workflowStage === WorkflowStage.COMPLETED && role === AgentRole.PUBLISHER && (
                         <button 
                            onClick={handleArchiveProject}
                            className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"
                        >
                            <Save className="w-5 h-5"/> Archive Project
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {project.panels.map((p, idx) => (
                        <div key={p.id} className="flex items-center gap-4 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800">
                             <div className="w-16 h-16 bg-zinc-900 rounded-lg overflow-hidden shrink-0">
                                {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-zinc-700"><ImageIcon className="w-6 h-6"/></div>}
                             </div>
                             <div className="flex-1 min-w-0">
                                 <h4 className="font-bold text-sm text-zinc-300">Scene {idx + 1}</h4>
                                 <div className="flex gap-4 mt-2">
                                     <div className={`flex items-center gap-1 text-xs ${p.audioUrl ? 'text-green-400' : 'text-zinc-600'}`}>
                                         <Mic className="w-3 h-3"/> {p.audioUrl ? 'Audio Ready' : 'No Audio'}
                                     </div>
                                     <div className={`flex items-center gap-1 text-xs ${p.videoUrl ? 'text-green-400' : 'text-zinc-600'}`}>
                                         <Video className="w-3 h-3"/> {p.videoUrl ? 'Video Rendered' : 'Static'}
                                     </div>
                                 </div>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        </div>
    );
  }

  // --- PROJECT MANAGER ---
  if (role === AgentRole.PROJECT_MANAGER) {
      return (
      <div className="h-full flex flex-col w-full relative overflow-y-auto">
        {renderProgressBar()}
        
        <div className="max-w-7xl mx-auto w-full px-6 pb-8">
            {/* Rejection Modal */}
            {showRejectModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-red-500 mb-4 flex gap-2 items-center"><AlertTriangle className="w-6 h-6"/> Reject Phase</h3>
                        <textarea 
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-4 text-zinc-200 h-32 mb-4 focus:ring-2 focus:ring-red-500 outline-none"
                            placeholder="Provide reason for rejection..."
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 text-zinc-400 hover:text-white transition-colors">Cancel</button>
                            <button onClick={handleConfirmReject} className="bg-red-600 hover:bg-red-500 px-6 py-2 rounded-lg text-white font-medium transition-colors">Confirm Rejection</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <img src={AGENTS[role].avatar} alt="Manager" className="w-16 h-16 rounded-full border-2 border-blue-500 shadow-blue-500/20 shadow-lg" />
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Director's Console</h2>
                        <div className="flex items-center gap-2">
                            <p className="text-zinc-400">Oversee production pipeline</p>
                            {isLongFormat && <span className="text-[10px] font-bold bg-amber-500 text-black px-2 py-0.5 rounded-full">LONG SERIES MODE</span>}
                        </div>
                    </div>
                </div>
                {/* Quick Status Pill */}
                <div className="hidden md:flex items-center gap-3 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800">
                    <div className={`w-2 h-2 rounded-full ${loading ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
                    <span className="text-sm font-medium text-zinc-300">{loading ? 'Agents Working...' : 'System Ready'}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full pb-8">
                {/* LEFT COLUMN: Project Configuration */}
                <div className="lg:col-span-1 space-y-6 flex flex-col">
                     <div className="bg-zinc-900/80 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800 shadow-xl flex-1">
                        <h3 className="font-bold text-zinc-100 mb-6 flex items-center gap-2 border-b border-zinc-800 pb-2">
                            <Settings className="w-5 h-5 text-blue-500" /> Project Settings
                        </h3>
                        
                        <div className="space-y-6">
                            {/* Theme Input */}
                            <div>
                                <label className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-2 block">Story Concept (Theme)</label>
                                <textarea
                                    value={project.theme || inputText}
                                    onChange={(e) => { setInputText(e.target.value); updateProject({ theme: e.target.value }); }}
                                    disabled={project.workflowStage !== WorkflowStage.IDLE && project.workflowStage !== WorkflowStage.RESEARCHING}
                                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-4 text-sm text-zinc-100 min-h-[120px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none leading-relaxed"
                                    placeholder="e.g. A cyberpunk detective solving crimes in Neo-Hanoi..."
                                />
                            </div>

                            {/* Dropdowns */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-2 block">Language</label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                                        <select 
                                            value={project.language || 'English'}
                                            onChange={(e) => updateProject({ language: e.target.value })}
                                            disabled={project.workflowStage !== WorkflowStage.IDLE}
                                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-2.5 pl-9 pr-3 text-sm text-zinc-200 focus:border-purple-500 outline-none appearance-none"
                                        >
                                            {SUPPORTED_LANGUAGES.map(lang => (
                                                <option key={lang} value={lang}>{lang}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-pink-400 font-bold uppercase tracking-wider mb-2 block">Art Style</label>
                                    <div className="relative">
                                        <Palette className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                                        <select 
                                            value={project.style}
                                            onChange={(e) => updateProject({ style: e.target.value })}
                                            disabled={project.workflowStage !== WorkflowStage.IDLE} // Visual style can be locked by research too
                                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-2.5 pl-9 pr-3 text-sm text-zinc-200 focus:border-pink-500 outline-none appearance-none"
                                        >
                                            <option>Modern Western Comic</option>
                                            <option>Japanese Manga</option>
                                            <option>Wuxia (Kiếm Hiệp)</option>
                                            <option>Xianxia (Tiên Hiệp)</option>
                                            <option>Horror Manga (Kinh Dị)</option>
                                            <option>Romance Manhwa (Tình Cảm)</option>
                                            <option>Noir</option>
                                            <option>Watercolor</option>
                                            <option>Cyberpunk</option>
                                            <option>Photorealistic (Lifelike)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-2 block">Story Format (Runtime)</label>
                                    <div className="relative">
                                        <Layers className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                                        <select 
                                            value={project.storyFormat}
                                            onChange={(e) => updateProject({ storyFormat: e.target.value as StoryFormat })}
                                            disabled={project.workflowStage !== WorkflowStage.IDLE}
                                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-2.5 pl-9 pr-3 text-sm text-zinc-200 focus:border-amber-500 outline-none appearance-none"
                                        >
                                            <option value="SHORT_STORY">Short Film (5-10 mins)</option>
                                            <option value="LONG_SERIES">Series Chapter 1 (30+ mins)</option>
                                            <option value="EPISODIC">Episodic/Sitcom (15-30 mins)</option>
                                        </select>
                                    </div>
                                </div>
                                {/* MODEL TIER SELECTOR */}
                                <div className="col-span-2">
                                    <label className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-2 block">Model Tier</label>
                                    <div className="relative">
                                        <Zap className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                                        <select 
                                            value={project.modelTier || 'STANDARD'}
                                            onChange={(e) => updateProject({ modelTier: e.target.value as 'STANDARD' | 'PREMIUM' })}
                                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg py-2.5 pl-9 pr-3 text-sm text-zinc-200 focus:border-emerald-500 outline-none appearance-none"
                                        >
                                            <option value="STANDARD">Standard (Free - Flash Models)</option>
                                            <option value="PREMIUM">Premium (Paid - Pro Models + Search)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                     </div>
                </div>

                {/* CENTER COLUMN: Pipeline Control */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                     <div className="bg-zinc-900/80 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800 shadow-xl h-full">
                        <h3 className="font-bold text-zinc-100 mb-6 flex items-center gap-2 border-b border-zinc-800 pb-2">
                            <Activity className="w-5 h-5 text-emerald-500" /> Production Pipeline
                        </h3>
                        
                        <div className="space-y-3">
                            {/* 1. Research */}
                            <div className="flex gap-2">
                                <button onClick={() => updateProject({workflowStage: WorkflowStage.RESEARCHING})} disabled={loading || !project.theme}
                                    className={`flex-1 py-4 px-5 rounded-xl flex items-center justify-between text-sm font-medium border transition-all duration-200 group
                                        ${project.workflowStage === WorkflowStage.IDLE 
                                            ? 'bg-gradient-to-r from-indigo-900/50 to-indigo-800/50 border-indigo-500/50 text-indigo-100 hover:border-indigo-400 hover:from-indigo-900 hover:to-indigo-800' 
                                            : 'bg-zinc-950 border-zinc-800 text-zinc-500 opacity-60'}
                                    `}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${project.workflowStage === WorkflowStage.IDLE ? 'bg-indigo-500/20' : 'bg-zinc-900'}`}>
                                            <TrendingUp className="w-4 h-4"/>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold">1. Market Research</div>
                                            <div className="text-[10px] opacity-70">Analyze {project.language} trends</div>
                                        </div>
                                    </div>
                                    {project.marketAnalysis && <CheckCircle className="w-5 h-5 text-green-500 drop-shadow-lg"/>}
                                </button>
                                {project.workflowStage === WorkflowStage.RESEARCHING && <button onClick={() => initiateReject(WorkflowStage.RESEARCHING)} className="px-4 bg-red-900/20 rounded-xl border border-red-900/50 hover:bg-red-900/40 transition-colors"><XCircle className="w-5 h-5 text-red-500"/></button>}
                            </div>

                            {/* 2. Script */}
                            <div className="flex gap-2">
                                <button onClick={handleApproveResearchAndScript} disabled={loading || !project.marketAnalysis || (project.workflowStage !== WorkflowStage.RESEARCHING && project.workflowStage !== WorkflowStage.SCRIPTING)}
                                    className={`flex-1 py-4 px-5 rounded-xl flex items-center justify-between text-sm font-medium border transition-all duration-200
                                        ${project.workflowStage === WorkflowStage.RESEARCHING 
                                            ? 'bg-gradient-to-r from-emerald-900/50 to-emerald-800/50 border-emerald-500/50 text-emerald-100 hover:border-emerald-400 hover:from-emerald-900 hover:to-emerald-800' 
                                            : 'bg-zinc-950 border-zinc-800 text-zinc-500 opacity-60'}
                                    `}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${project.workflowStage === WorkflowStage.RESEARCHING ? 'bg-emerald-500/20' : 'bg-zinc-900'}`}>
                                            <BookOpen className="w-4 h-4"/>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold">2. Scripting</div>
                                            <div className="text-[10px] opacity-70">
                                                {isLongFormat ? 'Series Bible + Chapter 1' : 'One-shot Script'}
                                            </div>
                                        </div>
                                    </div>
                                    {project.panels.length > 0 && <CheckCircle className="w-5 h-5 text-green-500 drop-shadow-lg"/>}
                                </button>
                                {project.workflowStage === WorkflowStage.CENSORING_SCRIPT && <button onClick={() => initiateReject(WorkflowStage.CENSORING_SCRIPT)} className="px-4 bg-red-900/20 rounded-xl border border-red-900/50 hover:bg-red-900/40 transition-colors"><XCircle className="w-5 h-5 text-red-500"/></button>}
                            </div>

                            {/* 3. Visuals */}
                            <div className="flex gap-2">
                                <button onClick={handleApproveScriptAndVisualize} disabled={loading || !project.panels.length || project.isCensored || project.workflowStage === WorkflowStage.POST_PRODUCTION || project.workflowStage === WorkflowStage.COMPLETED}
                                    className={`flex-1 py-4 px-5 rounded-xl flex items-center justify-between text-sm font-medium border transition-all duration-200
                                        ${project.workflowStage === WorkflowStage.CENSORING_SCRIPT 
                                            ? 'bg-gradient-to-r from-rose-900/50 to-rose-800/50 border-rose-500/50 text-rose-100 hover:border-rose-400 hover:from-rose-900 hover:to-rose-800' 
                                            : 'bg-zinc-950 border-zinc-800 text-zinc-500 opacity-60'}
                                    `}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${project.workflowStage === WorkflowStage.CENSORING_SCRIPT ? 'bg-rose-500/20' : 'bg-zinc-900'}`}>
                                            <Palette className="w-4 h-4"/>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold">3. Visuals</div>
                                            <div className="text-[10px] opacity-70">
                                                {isLongFormat ? 'Strict Char Locking' : 'Standard Design'}
                                            </div>
                                        </div>
                                    </div>
                                    {project.panels.some(p => p.imageUrl) && <CheckCircle className="w-5 h-5 text-green-500 drop-shadow-lg"/>}
                                </button>
                                {project.workflowStage === WorkflowStage.POST_PRODUCTION && <button onClick={() => initiateReject(WorkflowStage.POST_PRODUCTION)} className="px-4 bg-red-900/20 rounded-xl border border-red-900/50 hover:bg-red-900/40 transition-colors"><XCircle className="w-5 h-5 text-red-500"/></button>}
                            </div>

                            {/* 4. Motion */}
                            <div className="flex gap-2">
                                <button onClick={handleFinalizeProduction} disabled={loading || !project.panels.some(p => p.imageUrl) || project.workflowStage === WorkflowStage.COMPLETED}
                                    className={`flex-1 py-4 px-5 rounded-xl flex items-center justify-between text-sm font-medium border transition-all duration-200
                                        ${project.workflowStage === WorkflowStage.POST_PRODUCTION 
                                            ? 'bg-gradient-to-r from-amber-900/50 to-amber-800/50 border-amber-500/50 text-amber-100 hover:border-amber-400 hover:from-amber-900 hover:to-amber-800' 
                                            : 'bg-zinc-950 border-zinc-800 text-zinc-500 opacity-60'}
                                    `}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${project.workflowStage === WorkflowStage.POST_PRODUCTION ? 'bg-amber-500/20' : 'bg-zinc-900'}`}>
                                            <Video className="w-4 h-4"/>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold">4. Motion & Sound</div>
                                            <div className="text-[10px] opacity-70">Veo Video & TTS</div>
                                        </div>
                                    </div>
                                    {project.workflowStage === WorkflowStage.COMPLETED && <CheckCircle className="w-5 h-5 text-green-500 drop-shadow-lg"/>}
                                </button>
                                {project.workflowStage === WorkflowStage.COMPLETED && <button onClick={() => initiateReject(WorkflowStage.COMPLETED)} className="px-4 bg-red-900/20 rounded-xl border border-red-900/50 hover:bg-red-900/40 transition-colors"><XCircle className="w-5 h-5 text-red-500"/></button>}
                            </div>
                        </div>
                     </div>
                </div>

                {/* RIGHT COLUMN: Logs */}
                <div className="lg:col-span-1 bg-zinc-900/80 backdrop-blur-sm rounded-2xl border border-zinc-800 shadow-xl flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                        <h3 className="font-bold text-zinc-200">System Logs</h3>
                        <div className="flex gap-2">
                             <div className="w-2 h-2 rounded-full bg-red-500"></div>
                             <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                             <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-950/30 font-mono text-xs">
                        {project.logs.length === 0 && <div className="text-zinc-700 text-center italic mt-10">Waiting for input...</div>}
                        {project.logs.map((log) => (
                            <div key={log.id} className="flex gap-2 animate-fade-in">
                                <span className="text-zinc-600 shrink-0">[{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}]</span>
                                <div className="flex-1">
                                    <span className={`${log.type === 'error' ? 'text-red-400' : 'text-blue-400'} font-bold`}>{AGENTS[log.agentId].name}: </span>
                                    <span className={log.type === 'error' ? 'text-red-300' : log.type === 'success' ? 'text-green-300' : 'text-zinc-300'}>
                                        {log.message}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // Fallback for any other roles not explicitly handled
  return (
    <div className="h-full flex flex-col w-full relative overflow-y-auto">
        {renderProgressBar()}
        <div className="p-8 max-w-4xl mx-auto flex items-center justify-center flex-1">
            <div className="bg-zinc-900/50 border border-zinc-800 p-12 rounded-3xl text-center">
                <Users className="w-16 h-16 mx-auto text-zinc-700 mb-6"/>
                <h3 className="text-xl font-bold text-zinc-300 mb-2">Workspace Inactive</h3>
                <p className="text-zinc-500">Select an agent role from the sidebar to view their workspace.</p>
            </div>
        </div>
    </div>
  );
};

// Missing icon fix
const Share2 = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
)

const MessageSquare = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
)

export default AgentWorkspace;
