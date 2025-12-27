
export enum AgentRole {
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  MARKET_RESEARCHER = 'MARKET_RESEARCHER',
  SCRIPTWRITER = 'SCRIPTWRITER',
  CENSOR = 'CENSOR',
  TRANSLATOR = 'TRANSLATOR',
  CHARACTER_DESIGNER = 'CHARACTER_DESIGNER',
  PANEL_ARTIST = 'PANEL_ARTIST',
  CINEMATOGRAPHER = 'CINEMATOGRAPHER',
  VOICE_ACTOR = 'VOICE_ACTOR',
  PUBLISHER = 'PUBLISHER',
  ARCHIVIST = 'ARCHIVIST'
}

export interface Agent {
  id: AgentRole;
  name: string;
  avatar: string;
  description: string;
  color: string;
  department: string;
}

export interface ComicPanel {
  id: string;
  description: string;
  dialogue: string;
  caption?: string; 
  charactersInvolved: string[];
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string; 
  captionAudioUrl?: string;
  isGenerating?: boolean;
  shouldAnimate?: boolean;
  duration?: number;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  voice?: string; 
  isGenerating?: boolean;
  isLocked?: boolean;
  role?: 'MAIN' | 'SUPPORTING' | 'ANTAGONIST';
  personality?: string;
  consistencyStatus?: 'PENDING' | 'PASS' | 'FAIL';
  consistencyReport?: string;
}

export enum WorkflowStage {
  IDLE = 'IDLE',
  RESEARCHING = 'RESEARCHING',
  SCRIPTING = 'SCRIPTING',
  CENSORING_SCRIPT = 'CENSORING_SCRIPT',
  DESIGNING_CHARACTERS = 'DESIGNING_CHARACTERS',
  VISUALIZING_PANELS = 'VISUALIZING_PANELS',
  POST_PRODUCTION = 'POST_PRODUCTION',
  COMPLETED = 'COMPLETED'
}

export interface SystemLog {
  id: string;
  agentId: AgentRole;
  message: string;
  timestamp: number;
  type: 'info' | 'success' | 'error' | 'warning';
}

export interface ResearchData {
  suggestedTitle: string;
  targetAudience: string;
  visualStyle: string;
  narrativeStructure: string;
  // NEW: Direct control fields
  estimatedChapters: string; 
  worldSetting: string;
  
  colorPalette: string[];
  keyThemes: string[];
}

export interface StoryConcept {
    premise: string;
    similarStories: string[];
    uniqueTwist: string;
    genreTrends: string;
}

export type StoryFormat = 'SHORT_STORY' | 'LONG_SERIES' | 'EPISODIC';

export interface Message {
  role: 'user' | 'agent';
  content: string;
  timestamp: number;
}

export interface ComicProject {
  id?: string;
  lastModified?: number;
  title: string;
  theme: string;
  storyFormat: StoryFormat;
  modelTier?: 'STANDARD' | 'PREMIUM';

  seriesBible?: {
      worldSetting: string;
      mainConflict: string;
      characterArcs: string;
  };
  
  storyConcept?: StoryConcept;

  // NEW: Chat history specifically for the Research phase
  researchChatHistory: Message[]; 

  marketAnalysis?: ResearchData | null;
  censorReport?: string;
  isCensored: boolean;
  style: string;
  language: string;
  coverImage?: string;
  characters: Character[];
  panels: ComicPanel[];
  workflowStage: WorkflowStage;
  logs: SystemLog[];
}
