
export interface StoryPart {
  title: string;
  content: string;
}

export interface StoryResponse {
  parts: StoryPart[];
  summary: string;
  characters: string[];
  locations: string[];
}

export interface ImageDescription {
  sequence: number;
  scene: string;
  prompt: string;
}

export interface GeneratedImage {
  id: string;
  sequenceNumber: number;
  description: string;
  base64: string;
}

export interface WorkflowState {
  currentStep: number;
  sessionId: string | null;
  topic: string;
  titles: string[];
  selectedTitle: string | null;
  story: StoryResponse | null;
  imageDescriptions: ImageDescription[];
  generatedImages: GeneratedImage[];
  thumbnailDescription: string | null;
  youtubeDescription: string | null;
  isLoading: boolean;
  error: string | null;
  progress: {
    message: string;
    percentage: number;
  } | null;
  settings: {
    numberOfDescriptions: number;
    sheetUrl: string | null;
  };
}

export type WorkflowAction =
  | { type: 'START_WORKFLOW'; payload: string }
  | { type: 'SET_SESSION_ID'; payload: string }
  | { type: 'SET_TITLES'; payload: string[] }
  | { type: 'SELECT_TITLE'; payload: string }
  | { type: 'SET_STORY'; payload: StoryResponse }
  | { type: 'SET_IMAGE_DESCRIPTIONS'; payload: ImageDescription[] }
  | { type: 'ADD_GENERATED_IMAGE'; payload: GeneratedImage }
  | { type: 'SET_THUMBNAIL_DESCRIPTION'; payload: string }
  | { type: 'SET_YOUTUBE_DESCRIPTION'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'RESET' }
  | { type: 'SET_PROGRESS'; payload: { message: string; percentage: number } | null }
  | { type: 'UPDATE_SETTINGS'; payload: { numberOfDescriptions?: number; sheetUrl?: string; } };