import {
  AgentGoal,
  AgentRunState,
  AgentStep,
  AgentToolName,
  AgentRole,
  ComicProject,
  WorkflowStage,
  Character
} from '../types';
import { WorkflowStateMachine } from './workflowStateMachine';
import * as GeminiService from './geminiService';

export interface AgentRunContext {
  getProject: () => ComicProject;
  updateProject: (updates: Partial<ComicProject>) => void;
  addLog: (role: AgentRole, message: string, type: 'info' | 'success' | 'error' | 'warning') => void;
  onAgentChange: (role: AgentRole) => void;
  setRunState: (run: AgentRunState | null) => void;
}

type ToolHandler = (context: AgentRunContext) => Promise<Record<string, unknown>>;

const STAGE_ROLE_MAP: Record<WorkflowStage, AgentRole> = {
  [WorkflowStage.IDLE]: AgentRole.PROJECT_MANAGER,
  [WorkflowStage.RESEARCHING]: AgentRole.MARKET_RESEARCHER,
  [WorkflowStage.SCRIPTING]: AgentRole.SCRIPTWRITER,
  [WorkflowStage.CENSORING_SCRIPT]: AgentRole.CENSOR,
  [WorkflowStage.DESIGNING_CHARACTERS]: AgentRole.CHARACTER_DESIGNER,
  [WorkflowStage.VISUALIZING_PANELS]: AgentRole.PANEL_ARTIST,
  [WorkflowStage.PRINTING]: AgentRole.TYPESETTER,
  [WorkflowStage.POST_PRODUCTION]: AgentRole.CINEMATOGRAPHER,
  [WorkflowStage.COMPLETED]: AgentRole.PUBLISHER
};

const createRun = (goal: AgentGoal, steps: AgentStep[]): AgentRunState => ({
  id: crypto.randomUUID(),
  goal,
  status: 'RUNNING',
  steps,
  toolCalls: [],
  startedAt: Date.now(),
  updatedAt: Date.now()
});

const updateRun = (run: AgentRunState, updates: Partial<AgentRunState>, context: AgentRunContext) => {
  const next: AgentRunState = { ...run, ...updates, updatedAt: Date.now() };
  context.setRunState(next);
  return next;
};

const updateStep = (run: AgentRunState, stepId: string, updates: Partial<AgentStep>, context: AgentRunContext) => {
  const steps = run.steps.map(step => (step.id === stepId ? { ...step, ...updates } : step));
  return updateRun(run, { steps, currentStepId: stepId }, context);
};

const addToolCall = (run: AgentRunState, call: AgentRunState['toolCalls'][number], context: AgentRunContext) => {
  return updateRun(run, { toolCalls: [...run.toolCalls, call] }, context);
};

const planStepsForGoal = (goal: AgentGoal): AgentStep[] => {
  if (goal.type === 'CREATE_CHAPTER') {
    return [
      { id: crypto.randomUUID(), name: 'Research strategy', stage: WorkflowStage.RESEARCHING, tool: 'analyzeResearch', status: 'PENDING' },
      { id: crypto.randomUUID(), name: 'Generate script', stage: WorkflowStage.SCRIPTING, tool: 'generateScript', status: 'PENDING' },
      { id: crypto.randomUUID(), name: 'Censor script', stage: WorkflowStage.CENSORING_SCRIPT, tool: 'censorScript', status: 'PENDING' },
      { id: crypto.randomUUID(), name: 'Design characters', stage: WorkflowStage.DESIGNING_CHARACTERS, tool: 'generateCharacters', status: 'PENDING' },
      { id: crypto.randomUUID(), name: 'Render panels', stage: WorkflowStage.VISUALIZING_PANELS, tool: 'generatePanels', status: 'PENDING' }
    ];
  }

  return [];
};

const analyzeResearch: ToolHandler = async (context) => {
  const project = context.getProject();
  const sourceText = project.originalScript || project.theme || '';
  if (!sourceText.trim()) {
    throw new Error('Missing theme or manuscript for research.');
  }

  const tier = project.modelTier || 'STANDARD';
  const analysis = await GeminiService.analyzeUploadedManuscript(sourceText, project.masterLanguage, tier);
  const concept = await GeminiService.generateStoryConceptsWithSearch(
    analysis.suggestedTitle || project.theme || 'Comic Story',
    analysis.visualStyle || project.style || 'Cinematic',
    project.masterLanguage,
    tier
  );

  let artStyleGuide = project.artStyleGuide;
  try {
    artStyleGuide = await GeminiService.generateArtStyleGuide(
      analysis.visualStyle || project.style || 'Cinematic',
      analysis.worldSetting || '',
      project.masterLanguage,
      tier
    );
  } catch (e) {
    // Keep existing guide if generation fails.
  }

  context.updateProject({
    marketAnalysis: analysis,
    storyConcept: concept,
    title: analysis.suggestedTitle || project.title,
    style: analysis.visualStyle || project.style,
    artStyleGuide
  });

  context.addLog(AgentRole.MARKET_RESEARCHER, 'Research complete.', 'success');
  return { suggestedTitle: analysis.suggestedTitle || project.title };
};

const generateScript: ToolHandler = async (context) => {
  const project = context.getProject();
  if (!project.marketAnalysis || !project.storyConcept) {
    throw new Error('Missing research results for script generation.');
  }

  const tier = project.modelTier || 'STANDARD';
  const targetChapter = project.currentChapter || 1;
  const chapterSummary =
    project.marketAnalysis.chapterOutlines?.find(c => c.chapterNumber === targetChapter)?.summary || '';

  let seriesBible = project.seriesBible;
  if (!seriesBible && project.storyFormat && project.storyFormat !== 'SHORT_STORY') {
    seriesBible = await GeminiService.generateSeriesBible(project.theme, project.style, project.masterLanguage, tier);
    context.updateProject({ seriesBible });
  }

  const result = await GeminiService.generateScript(
    project.theme || project.marketAnalysis.suggestedTitle,
    project.marketAnalysis.visualStyle || project.style,
    project.masterLanguage,
    project.storyFormat,
    seriesBible,
    tier,
    project.storyConcept,
    project.characters,
    chapterSummary,
    targetChapter,
    project.originalScript,
    project.marketAnalysis.worldSetting,
    project.targetPanelCount
  );

  context.updateProject({
    title: result.title || project.title,
    panels: result.panels,
    workflowStage: WorkflowStage.CENSORING_SCRIPT
  });

  context.addLog(AgentRole.SCRIPTWRITER, `Script generated (${result.panels.length} panels).`, 'success');
  return { panelCount: result.panels.length };
};

const censorScript: ToolHandler = async (context) => {
  const project = context.getProject();
  const fullText = project.panels.map(p => `${p.description} ${p.dialogue}`).join('\n');
  const result = await GeminiService.censorContent(fullText, 'SCRIPT');
  const report = result.report?.trim() || (result.passed ? 'Passed compliance scan.' : 'Failed compliance scan.');
  context.updateProject({
    censorReport: report,
    isCensored: !result.passed,
    workflowStage: result.passed ? WorkflowStage.DESIGNING_CHARACTERS : WorkflowStage.CENSORING_SCRIPT
  });

  context.addLog(AgentRole.CENSOR, result.passed ? 'Compliance passed.' : 'Compliance failed.', result.passed ? 'success' : 'warning');
  if (!result.passed) throw new Error('Script failed compliance.');
  return { passed: result.passed };
};

const generateCharacters: ToolHandler = async (context) => {
  const project = context.getProject();
  const tier = project.modelTier || 'STANDARD';
  const setting = project.seriesBible?.worldSetting || project.marketAnalysis?.worldSetting || 'Standard';
  const sourceText = project.originalScript || '';

  let characters = project.characters || [];
  if (characters.length === 0) {
    const newChars = await GeminiService.generateComplexCharacters(
      project.storyConcept || { premise: 'Comic Story', similarStories: [], uniqueTwist: '', genreTrends: '' },
      project.masterLanguage,
      setting,
      tier,
      sourceText
    );
    characters = newChars.map(c => ({ ...c, id: crypto.randomUUID() }));
    context.updateProject({ characters });
  }

  const styleGuide =
    project.artStyleGuide ||
    (await GeminiService.generateArtStyleGuide(project.style || 'Cinematic', setting, project.masterLanguage, tier));

  const imageModel = project.imageModel || 'gemini-2.5-flash-image';
  const updatedChars: Character[] = [];
  for (const char of characters) {
    if (char.imageUrl) {
      updatedChars.push(char);
      continue;
    }
    const result = await GeminiService.generateCharacterDesign(
      char.name,
      styleGuide,
      char.description,
      setting,
      tier,
      imageModel,
      char.referenceImage,
      undefined,
      project.imageProvider
    );
    updatedChars.push({ ...char, imageUrl: result.imageUrl, description: result.description });
  }

  context.updateProject({
    characters: updatedChars,
    artStyleGuide: styleGuide,
    workflowStage: WorkflowStage.DESIGNING_CHARACTERS
  });

  context.addLog(AgentRole.CHARACTER_DESIGNER, 'Character designs generated.', 'success');
  return { characterCount: updatedChars.length };
};

const generatePanels: ToolHandler = async (context) => {
  const project = context.getProject();
  const tier = project.modelTier || 'STANDARD';
  const styleGuide =
    project.artStyleGuide ||
    (await GeminiService.generateArtStyleGuide(project.style || 'Cinematic', project.marketAnalysis?.worldSetting || '', project.masterLanguage, tier));

  const worldSetting = project.seriesBible?.worldSetting || project.marketAnalysis?.worldSetting || 'Standard';
  const imageModel = project.imageModel || 'gemini-2.5-flash-image';
  const provider = project.imageProvider;

  const updatedPanels = [...project.panels];
  for (let i = 0; i < updatedPanels.length; i++) {
    const panel = updatedPanels[i];
    if (panel.imageUrl) continue;
    const imageUrl = await GeminiService.generatePanelImage(
      panel,
      styleGuide,
      project.characters,
      worldSetting,
      tier,
      imageModel,
      undefined,
      undefined,
      provider
    );
    updatedPanels[i] = { ...panel, imageUrl };
  }

  context.updateProject({
    panels: updatedPanels,
    artStyleGuide: styleGuide,
    workflowStage: WorkflowStage.VISUALIZING_PANELS
  });

  context.addLog(AgentRole.PANEL_ARTIST, 'Panel rendering complete.', 'success');
  return { renderedPanels: updatedPanels.length };
};

const TOOL_REGISTRY: Record<AgentToolName, ToolHandler> = {
  analyzeResearch,
  generateScript,
  censorScript,
  generateCharacters,
  generatePanels
};

export const runAgentGoal = (goal: AgentGoal, context: AgentRunContext) => {
  const steps = planStepsForGoal(goal);
  let run = createRun(goal, steps);
  context.setRunState(run);

  let cancelled = false;
  const cancel = () => {
    cancelled = true;
    run = updateRun(run, { status: 'CANCELED' }, context);
    context.addLog(AgentRole.PROJECT_MANAGER, 'Auto-run canceled.', 'warning');
  };

  const execute = async () => {
    context.addLog(
      AgentRole.PROJECT_MANAGER,
      `Auto-run started for Chapter ${goal.chapterNumber}.`,
      'info'
    );
    for (const step of run.steps) {
      if (cancelled) return;

      const project = context.getProject();
      const gate = WorkflowStateMachine.canTransitionTo(project, step.stage);
      if (!gate.allowed && project.workflowStage !== step.stage) {
        run = updateStep(run, step.id, { status: 'ERROR', error: gate.reason, finishedAt: Date.now() }, context);
        run = updateRun(run, { status: 'FAILED', error: gate.reason }, context);
        context.addLog(
          STAGE_ROLE_MAP[step.stage] || AgentRole.PROJECT_MANAGER,
          `Auto-run blocked before "${step.name}": ${gate.reason}`,
          'error'
        );
        return;
      }

      context.onAgentChange(STAGE_ROLE_MAP[step.stage]);
      context.updateProject({ workflowStage: step.stage });

      run = updateStep(run, step.id, { status: 'RUNNING', startedAt: Date.now() }, context);

      const callId = crypto.randomUUID();
      const callInput = { stage: step.stage, tool: step.tool, goal: goal.type };
      try {
        const output = await TOOL_REGISTRY[step.tool](context);
        run = addToolCall(
          run,
          { id: callId, name: step.tool, input: callInput, output, timestamp: Date.now() },
          context
        );
        run = updateStep(run, step.id, { status: 'DONE', finishedAt: Date.now() }, context);
      } catch (e: any) {
        run = addToolCall(
          run,
          { id: callId, name: step.tool, input: callInput, error: e.message || 'Tool error', timestamp: Date.now() },
          context
        );
        run = updateStep(run, step.id, { status: 'ERROR', error: e.message || 'Tool error', finishedAt: Date.now() }, context);
        run = updateRun(run, { status: 'FAILED', error: e.message || 'Tool error' }, context);
        context.addLog(
          STAGE_ROLE_MAP[step.stage] || AgentRole.PROJECT_MANAGER,
          `Auto-run failed at "${step.name}": ${e.message || 'Tool error'}`,
          'error'
        );
        return;
      }
    }

    run = updateRun(run, { status: 'COMPLETED' }, context);
    context.addLog(AgentRole.PROJECT_MANAGER, 'Auto-run completed.', 'success');
  };

  void execute();
  return { cancel };
};
