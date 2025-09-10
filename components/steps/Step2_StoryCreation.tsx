
import React, { useCallback, useEffect } from 'react';
import { useWorkflowState } from '../../hooks/useWorkflowState';
import { generateStory } from '../../services/geminiService';
import { saveToSheet } from '../../services/googleSheetService';
import StepContainer from '../StepContainer';
import LoadingSpinner from '../shared/LoadingSpinner';
import DownloadButton from '../shared/DownloadButton';

const Step2StoryCreation: React.FC = () => {
  const { state, dispatch } = useWorkflowState();

  const handleGenerate = useCallback(async () => {
    if (!state.selectedTitle) {
      dispatch({ type: 'SET_ERROR', payload: 'No title selected.' });
      return;
    }
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const storyData = await generateStory(state.selectedTitle);
      dispatch({ type: 'SET_STORY', payload: storyData });

      // Save progress to sheet
      await saveToSheet(state.sessionId, state.settings.sheetUrl, {
        'Titulo': state.selectedTitle,
        'sumario': storyData.summary,
        'parte1': storyData.parts[0]?.content,
        'parte2': storyData.parts[1]?.content,
        'parte3': storyData.parts[2]?.content,
        'parte4': storyData.parts[3]?.content,
      });

    } catch (e: any) {
      dispatch({ type: 'SET_ERROR', payload: e.message });
    }
  }, [state.selectedTitle, state.sessionId, state.settings.sheetUrl, dispatch]);

  useEffect(() => {
    if (!state.story && state.selectedTitle) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedTitle]);

  const handleNext = () => dispatch({ type: 'NEXT_STEP' });
  const handleBack = () => dispatch({ type: 'PREVIOUS_STEP' });
  
  const getFullStoryText = () => {
      if (!state.story) return "";
      let text = `Title: ${state.selectedTitle}\n\nSummary: ${state.story.summary}\n\n`;
      state.story.parts.forEach(part => {
          text += `--- ${part.title} ---\n\n${part.content}\n\n`;
      });
      return text;
  }

  return (
    <StepContainer
      title="Step 2: Create the Story"
      description="The AI is now generating a detailed 4-part story based on your chosen title. This may take a moment."
      onNext={handleNext}
      onBack={handleBack}
      isNextDisabled={!state.story || state.isLoading}
      isBackDisabled={state.isLoading}
    >
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 mb-6">
        <p className="text-sm text-gray-500">Selected Title</p>
        <p className="font-semibold text-lg text-gray-900">{state.selectedTitle}</p>
      </div>

      {state.isLoading && <LoadingSpinner message="Crafting your story..."/>}
      {state.error && <div className="text-red-600 bg-red-100 p-3 rounded-md">{state.error}</div>}

      {state.story && !state.isLoading && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Generated Story</h3>
            <DownloadButton data={getFullStoryText()} filename="story.txt" contentType="text/plain" />
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold">Summary</h4>
            <p className="text-gray-700">{state.story.summary}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.story.parts.map((part, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-semibold text-lg text-gray-800">{part.title}</h4>
                <p className="text-gray-600 mt-2 text-sm line-clamp-4">{part.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </StepContainer>
  );
};

export default Step2StoryCreation;