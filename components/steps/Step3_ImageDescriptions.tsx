

import React, { useCallback, useEffect } from 'react';
import { useWorkflowState } from '../../hooks/useWorkflowState';
import { generateImageDescriptions } from '../../services/geminiService';
import { saveToSheet } from '../../services/googleSheetService';
import StepContainer from '../StepContainer';
import LoadingSpinner from '../shared/LoadingSpinner';
import DownloadButton from '../shared/DownloadButton';

const Step3ImageDescriptions: React.FC = () => {
  const { state, dispatch } = useWorkflowState();

  const handleGenerate = useCallback(async () => {
    if (!state.story?.summary) {
      dispatch({ type: 'SET_ERROR', payload: 'Story summary is not available.' });
      return;
    }
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const descriptions = await generateImageDescriptions(state.story.summary, state.settings.numberOfDescriptions);
      dispatch({ type: 'SET_IMAGE_DESCRIPTIONS', payload: descriptions });

      // Save progress to sheet
      await saveToSheet(state.sessionId, state.settings.sheetUrl, {
        'descricao_imagens': descriptions.map(d => `Cena ${d.sequence}: ${d.prompt}`).join('\n\n'),
      });

    } catch (e: any)      {
      dispatch({ type: 'SET_ERROR', payload: e.message });
    }
  }, [state.story?.summary, state.settings.numberOfDescriptions, state.sessionId, state.settings.sheetUrl, dispatch]);

  useEffect(() => {
    if (state.imageDescriptions.length === 0 && state.story) {
        handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.story]);

  const handleNext = () => dispatch({ type: 'NEXT_STEP' });
  const handleBack = () => dispatch({ type: 'PREVIOUS_STEP' });

  const getImageDescriptionsText = () => {
    if (!state.imageDescriptions || state.imageDescriptions.length === 0) return "";
    
    // Add a title and join descriptions for a clean text file.
    let content = `Image Descriptions for video titled: "${state.selectedTitle}"\n\n`;
    content += state.imageDescriptions
      .map(desc => `--- ${desc.scene} (Scene ${desc.sequence}) ---\n${desc.prompt}`)
      .join('\n\n');
    return content;
  };

  return (
    <StepContainer
      title="Step 4: Generate Image Descriptions"
      description={`Based on the story, the AI is creating ${state.settings.numberOfDescriptions} sequential descriptions for the video's visuals.`}
      onNext={handleNext}
      onBack={handleBack}
      isNextDisabled={state.imageDescriptions.length === 0 || state.isLoading}
      isBackDisabled={state.isLoading}
    >
      {state.isLoading && <LoadingSpinner message="Visualizing scenes..." />}
      {state.error && <div className="text-red-600 bg-red-100 p-3 rounded-md">{state.error}</div>}
      
      {!state.isLoading && state.imageDescriptions.length > 0 && (
         <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Generated Descriptions</h3>
                <DownloadButton 
                    data={getImageDescriptionsText()} 
                    filename="image_descriptions.txt" 
                    contentType="text/plain" 
                />
            </div>
            <div className="max-h-[500px] overflow-y-auto space-y-3 pr-2">
                {state.imageDescriptions.map((desc) => (
                    <div key={desc.sequence} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <p className="font-bold text-blue-700">Scene {desc.sequence}</p>
                        <p className="mt-1 text-sm text-gray-700">{desc.prompt}</p>
                    </div>
                ))}
            </div>
         </div>
      )}
    </StepContainer>
  );
};

export default Step3ImageDescriptions;