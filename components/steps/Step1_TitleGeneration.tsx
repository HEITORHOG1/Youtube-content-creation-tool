
import React, { useState, useCallback } from 'react';
import { useWorkflowState } from '../../hooks/useWorkflowState';
import { generateTitles } from '../../services/geminiService';
import StepContainer from '../StepContainer';
import LoadingSpinner from '../shared/LoadingSpinner';

const Step1TitleGeneration: React.FC = () => {
  const { state, dispatch } = useWorkflowState();
  const [localTopic, setLocalTopic] = useState(state.topic);

  const handleGenerate = useCallback(async () => {
    if (!localTopic.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'Please enter a topic.' });
      return;
    }
    
    // Create a unique session ID for this workflow run
    const sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    dispatch({ type: 'SET_SESSION_ID', payload: sessionId });
    
    dispatch({ type: 'START_WORKFLOW', payload: localTopic });
    try {
      const titles = await generateTitles(localTopic);
      dispatch({ type: 'SET_TITLES', payload: titles });
    } catch (e: any) {
      dispatch({ type: 'SET_ERROR', payload: e.message });
    }
  }, [localTopic, dispatch]);

  const handleSelectTitle = (title: string) => {
    dispatch({ type: 'SELECT_TITLE', payload: title });
  };
  
  const handleNext = () => {
      dispatch({ type: 'NEXT_STEP' });
  };

  return (
    <StepContainer
      title="Step 1: Generate Video Titles"
      description="Start by entering a topic or theme for your video. Our AI will generate engaging and clickable titles for you."
      onNext={handleNext}
      isNextDisabled={!state.selectedTitle || state.isLoading}
      showBack={false}
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={localTopic}
            onChange={(e) => setLocalTopic(e.target.value)}
            placeholder="e.g., 'The history of ancient Rome'"
            className="flex-grow p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            disabled={state.isLoading}
          />
          <button
            onClick={handleGenerate}
            disabled={state.isLoading || !localTopic.trim()}
            className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {state.isLoading ? 'Generating...' : 'Generate Titles'}
          </button>
        </div>

        {state.error && <div className="text-red-600 bg-red-100 p-3 rounded-md">{state.error}</div>}

        {state.isLoading && <LoadingSpinner />}
        
        {!state.isLoading && state.titles.length > 0 && (
          <div className="space-y-3 pt-4">
            <h3 className="text-lg font-semibold text-gray-800">Choose a title:</h3>
            {state.titles.map((title, index) => (
              <div
                key={index}
                onClick={() => handleSelectTitle(title)}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  state.selectedTitle === title
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                    : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <p className="font-medium text-gray-900">{title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </StepContainer>
  );
};

export default Step1TitleGeneration;