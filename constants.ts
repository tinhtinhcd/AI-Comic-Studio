
import { Agent, AgentRole, WorkflowStage, ComicProject } from './types';

export const AGENTS: Record<AgentRole, Agent> = {
  [AgentRole.PROJECT_MANAGER]: {
    id: AgentRole.PROJECT_MANAGER,
    name: 'Director (You)',
    avatar: 'https://picsum.photos/seed/manager/100/100',
    description: 'Supervises the pipeline.',
    color: 'bg-blue-600',
    department: 'Strategy & Direction'
  },
  [AgentRole.MARKET_RESEARCHER]: {
    id: AgentRole.MARKET_RESEARCHER,
    name: 'Strategic Planner',
    avatar: 'https://picsum.photos/seed/researcher/100/100',
    description: 'Defines style & audience.',
    color: 'bg-indigo-500',
    department: 'Strategy & Direction'
  },
  [AgentRole.SCRIPTWRITER]: {
    id: AgentRole.SCRIPTWRITER,
    name: 'Scriptwriter',
    avatar: 'https://picsum.photos/seed/writer/100/100',
    description: 'Generates plot & dialogue.',
    color: 'bg-emerald-600',
    department: "Writers' Room"
  },
  [AgentRole.CENSOR]: {
    id: AgentRole.CENSOR,
    name: 'Safety Inspector',
    avatar: 'https://picsum.photos/seed/censor/100/100',
    description: 'Checks policy compliance.',
    color: 'bg-red-600',
    department: "Writers' Room"
  },
  [AgentRole.TRANSLATOR]: {
    id: AgentRole.TRANSLATOR,
    name: 'Translator',
    avatar: 'https://picsum.photos/seed/translator/100/100',
    description: 'Localizes script.',
    color: 'bg-cyan-600',
    department: "Writers' Room"
  },
  [AgentRole.CHARACTER_DESIGNER]: {
    id: AgentRole.CHARACTER_DESIGNER,
    name: 'Char. Designer',
    avatar: 'https://picsum.photos/seed/designer/100/100',
    description: 'Visualizes characters.',
    color: 'bg-purple-600',
    department: 'Visual Arts Dept'
  },
  [AgentRole.PANEL_ARTIST]: {
    id: AgentRole.PANEL_ARTIST,
    name: 'Panel Artist',
    avatar: 'https://picsum.photos/seed/artist/100/100',
    description: 'Draws static panel art.',
    color: 'bg-rose-600',
    department: 'Visual Arts Dept'
  },
  [AgentRole.VOICE_ACTOR]: {
    id: AgentRole.VOICE_ACTOR,
    name: 'Voice Actor',
    avatar: 'https://picsum.photos/seed/voice/100/100',
    description: 'Generates speech.',
    color: 'bg-pink-600',
    department: 'Production Studio'
  },
  [AgentRole.CINEMATOGRAPHER]: {
    id: AgentRole.CINEMATOGRAPHER,
    name: 'Cinematographer',
    avatar: 'https://picsum.photos/seed/video/100/100',
    description: 'Animates panels (Veo).',
    color: 'bg-orange-600',
    department: 'Production Studio'
  },
  [AgentRole.PUBLISHER]: {
    id: AgentRole.PUBLISHER,
    name: 'Publisher',
    avatar: 'https://picsum.photos/seed/publisher/100/100',
    description: 'Finalizes release.',
    color: 'bg-amber-600',
    department: 'Production Studio'
  },
  [AgentRole.ARCHIVIST]: {
    id: AgentRole.ARCHIVIST,
    name: 'Archivist',
    avatar: 'https://picsum.photos/seed/archivist/100/100',
    description: 'Stores scripts (Text).',
    color: 'bg-stone-600',
    department: 'Production Studio'
  }
};

export const INITIAL_PROJECT_STATE: ComicProject = {
  title: 'Untitled Comic',
  theme: '',
  storyFormat: 'SHORT_STORY', 
  modelTier: 'STANDARD', 
  marketAnalysis: null,
  researchChatHistory: [], // Initialize empty
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
