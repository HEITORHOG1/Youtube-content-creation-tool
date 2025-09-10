
import React, { createContext, useReducer, useContext, Dispatch } from 'react';
import type { WorkflowState, WorkflowAction } from '../types';

const initialState: WorkflowState = {
  currentStep: 1,
  sessionId: null,
  topic: '',
  titles: [],
  selectedTitle: null,
  story: null,
  imageDescriptions: [],
  generatedImages: [],
  thumbnailDescription: null,
  youtubeDescription: null,
  isLoading: false,
  error: null,
  progress: null,
  settings: {
    numberOfDescriptions: 15,
    sheetUrl: null,
  },
};

const WorkflowStateContext = createContext<WorkflowState>(initialState);
const WorkflowDispatchContext = createContext<Dispatch<WorkflowAction>>(() => null);

const workflowReducer = (state: WorkflowState, action: WorkflowAction): WorkflowState => {
  switch (action.type) {
    case 'START_WORKFLOW':
      return { ...initialState, sessionId: state.sessionId, topic: action.payload, isLoading: true, error: null, settings: state.settings };
    case 'SET_SESSION_ID':
      return { ...state, sessionId: action.payload };
    case 'SET_TITLES':
      return { ...state, titles: action.payload, isLoading: false };
    case 'SELECT_TITLE':
      return { ...state, selectedTitle: action.payload };
    case 'NEXT_STEP':
      return { ...state, currentStep: state.currentStep + 1, error: null, progress: null };
    case 'PREVIOUS_STEP':
      return { ...state, currentStep: state.currentStep - 1, error: null, progress: null };
    case 'SET_STORY':
        return { ...state, story: action.payload, isLoading: false };
    case 'SET_IMAGE_DESCRIPTIONS':
        return { ...state, imageDescriptions: action.payload, isLoading: false, generatedImages: [] };
    case 'ADD_GENERATED_IMAGE':
        return { ...state, generatedImages: [...state.generatedImages, action.payload].sort((a,b) => a.sequenceNumber - b.sequenceNumber) };
    case 'SET_THUMBNAIL_DESCRIPTION':
        return { ...state, thumbnailDescription: action.payload, isLoading: false };
    case 'SET_YOUTUBE_DESCRIPTION':
        return { ...state, youtubeDescription: action.payload, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false, progress: null };
    case 'SET_PROGRESS':
      return { ...state, progress: action.payload, isLoading: action.payload !== null };
    case 'UPDATE_SETTINGS':
      return { 
        ...state, 
        settings: { ...state.settings, ...action.payload }
      };
    case 'RESET':
      // Preserve settings on reset
      return { ...initialState, settings: state.settings };
    default:
      return state;
  }
};

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(workflowReducer, initialState);

  return (
    <WorkflowStateContext.Provider value={state}>
      <WorkflowDispatchContext.Provider value={dispatch}>
        {children}
      </WorkflowDispatchContext.Provider>
    </WorkflowStateContext.Provider>
  );
};

export const useWorkflowState = () => {
  const state = useContext(WorkflowStateContext);
  const dispatch = useContext(WorkflowDispatchContext);
  if (state === undefined || dispatch === undefined) {
    throw new Error('useWorkflowState must be used within a WorkflowProvider');
  }
  return { state, dispatch };
};