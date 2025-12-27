import { Agent, AgentRole, WorkflowStage, ComicProject } from './types';

export const AGENTS: Record<AgentRole, Agent> = {
  [AgentRole.PROJECT_MANAGER]: {
    id: AgentRole.PROJECT_MANAGER,
    name: 'Director (You)',
    avatar: 'https://picsum.photos/seed/manager/100/100',
    description: 'Supervises the pipeline and gives approvals.',
    color: 'bg-blue-600'
  },
  [AgentRole.MARKET_RESEARCHER]: {
    id: AgentRole.MARKET_RESEARCHER,
    name: 'Strategic Planner',
    avatar: 'https://picsum.photos/seed/researcher/100/100',
    description: 'Defines visual style, title, and audience strategy.',
    color: 'bg-indigo-500'
  },
  [AgentRole.SCRIPTWRITER]: {
    id: AgentRole.SCRIPTWRITER,
    name: 'Scriptwriter',
    avatar: 'https://picsum.photos/seed/writer/100/100',
    description: 'Generates plot and dialogue.',
    color: 'bg-emerald-600'
  },
  [AgentRole.CENSOR]: {
    id: AgentRole.CENSOR,
    name: 'Safety Inspector',
    avatar: 'https://picsum.photos/seed/censor/100/100',
    description: 'Checks content for policy violations.',
    color: 'bg-red-600'
  },
  [AgentRole.TRANSLATOR]: {
    id: AgentRole.TRANSLATOR,
    name: 'Translator',
    avatar: 'https://picsum.photos/seed/translator/100/100',
    description: 'Localizes script.',
    color: 'bg-cyan-600'
  },
  [AgentRole.CHARACTER_DESIGNER]: {
    id: AgentRole.CHARACTER_DESIGNER,
    name: 'Char. Designer',
    avatar: 'https://picsum.photos/seed/designer/100/100',
    description: 'Visualizes characters.',
    color: 'bg-purple-600'
  },
  [AgentRole.PANEL_ARTIST]: {
    id: AgentRole.PANEL_ARTIST,
    name: 'Panel Artist',
    avatar: 'https://picsum.photos/seed/artist/100/100',
    description: 'Draws static panel art.',
    color: 'bg-rose-600'
  },
  [AgentRole.CINEMATOGRAPHER]: {
    id: AgentRole.CINEMATOGRAPHER,
    name: 'Cinematographer',
    avatar: 'https://picsum.photos/seed/video/100/100',
    description: 'Animates panels (Veo).',
    color: 'bg-orange-600'
  },
  [AgentRole.VOICE_ACTOR]: {
    id: AgentRole.VOICE_ACTOR,
    name: 'Voice Actor',
    avatar: 'https://picsum.photos/seed/voice/100/100',
    description: 'Generates speech.',
    color: 'bg-pink-600'
  },
  [AgentRole.PUBLISHER]: {
    id: AgentRole.PUBLISHER,
    name: 'Publisher',
    avatar: 'https://picsum.photos/seed/publisher/100/100',
    description: 'Finalizes release.',
    color: 'bg-amber-600'
  },
  [AgentRole.ARCHIVIST]: {
    id: AgentRole.ARCHIVIST,
    name: 'Archivist',
    avatar: 'https://picsum.photos/seed/archivist/100/100',
    description: 'Stores scripts and project metadata (Text only).',
    color: 'bg-stone-600'
  }
};

export const INITIAL_PROJECT_STATE: ComicProject = {
  title: 'Untitled Comic',
  theme: '',
  storyFormat: 'SHORT_STORY', // Default
  modelTier: 'STANDARD', // Default to Free tier to prevent errors
  marketAnalysis: null,
  censorReport: '',
  isCensored: false,
  style: 'Modern Western Comic',
  language: 'English',
  coverImage: undefined,
  characters: [],
  panels: [],
  workflowStage: WorkflowStage.IDLE,
  logs: []
};
