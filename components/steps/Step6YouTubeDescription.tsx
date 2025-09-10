
import React, { useCallback, useEffect } from 'react';
import { useWorkflowState } from '../../hooks/useWorkflowState';
import { generateYoutubeDescription } from '../../services/geminiService';
import { saveToSheet } from '../../services/googleSheetService';
import StepContainer from '../StepContainer';
import LoadingSpinner from '../shared/LoadingSpinner';
import DownloadButton from '../shared/DownloadButton';

const Step6YouTubeDescription: React.FC = () => {
  const { state, dispatch } = useWorkflowState();

  const handleGenerate = useCallback(async () => {
    if (!state.story?.summary || !state.selectedTitle) {
      dispatch({ type: 'SET_ERROR', payload: 'Story summary or title is not available.' });
      return;
    }
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const description = await generateYoutubeDescription(state.selectedTitle, state.story.summary);
      dispatch({ type: 'SET_YOUTUBE_DESCRIPTION', payload: description });

      // Save progress to sheet
      await saveToSheet(state.sessionId, state.settings.sheetUrl, {
        'descricao_youtube': description,
      });

    } catch (e: any)      {
      dispatch({ type: 'SET_ERROR', payload: e.message });
    }
  }, [state.story?.summary, state.selectedTitle, state.sessionId, state.settings.sheetUrl, dispatch]);

  useEffect(() => {
    if (!state.youtubeDescription && state.story) {
        handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.story]);

  const handleNext = () => dispatch({ type: 'NEXT_STEP' });
  const handleBack = () => dispatch({ type: 'PREVIOUS_STEP' });

  return (
    <StepContainer
      title="Step 6: Generate SEO Description"
      description="The AI is creating a YouTube video description optimized with a hook, keywords, and hashtags."
      onNext={handleNext}
      onBack={handleBack}
      isNextDisabled={!state.youtubeDescription || state.isLoading}
      isBackDisabled={state.isLoading}
    >
      {state.isLoading && <LoadingSpinner message="Optimizing for YouTube..." />}
      {state.error && <div className="text-red-600 bg-red-100 p-3 rounded-md">{state.error}</div>}
      
      {!state.isLoading && state.youtubeDescription && (
         <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Generated YouTube Description</h3>
                <DownloadButton 
                    data={state.youtubeDescription} 
                    filename="youtube_description.txt" 
                    contentType="text/plain" 
                />
            </div>
            <textarea
                readOnly
                value={state.youtubeDescription}
                className="w-full h-64 p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-800 resize-none focus:ring-blue-500 focus:border-blue-500"
                aria-label="Generated YouTube Description"
            />
         </div>
      )}
    </StepContainer>
  );
};

export default Step6YouTubeDescription;
