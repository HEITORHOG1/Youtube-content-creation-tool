import React, { useState } from 'react';
import { useWorkflowState } from '../../hooks/useWorkflowState';
import { generateSpeech } from '../../services/geminiService';
import StepContainer from '../StepContainer';
import DownloadButton from '../shared/DownloadButton';
import LoadingSpinner from '../shared/LoadingSpinner';

type AudioGenerationState = {
    [key: number]: {
        isLoading: boolean;
        audioData: string | null;
        error: string | null;
        progress: number;
    };
};

const AudioErrorDisplay: React.FC<{ error: string | null }> = ({ error }) => {
    if (!error) return null;

    let title = "Generation Error";
    let message = "An unexpected error occurred. Please try again.";
    let iconSvg = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
    );
    let colors = "bg-red-50 border-red-200 text-red-800";

    if (error.includes('[Rate Limit Exceeded]')) {
        title = "Service Busy";
        message = "Too many requests are being sent. Please wait a moment before retrying.";
        iconSvg = (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z" clipRule="evenodd" />
            </svg>
        );
        colors = "bg-yellow-50 border-yellow-200 text-yellow-800";
    } else if (error.includes('did not return valid data')) {
        message = "The AI failed to create audio. This can happen if the text is too long or contains unsupported characters. Please try again.";
    } else {
        message = error;
    }

    return (
        <div className={`p-3 rounded-md mt-2 text-xs flex items-start space-x-3 border ${colors}`}>
            <div className="flex-shrink-0 mt-px">{iconSvg}</div>
            <div>
                <p className="font-semibold">{title}</p>
                <p className="mt-1">{message}</p>
            </div>
        </div>
    );
};


const Step3AudioGeneration: React.FC = () => {
    const { state, dispatch } = useWorkflowState();
    const [audioState, setAudioState] = useState<AudioGenerationState>({});

    const handleGenerateAudio = async (text: string, partIndex: number) => {
        const cacheKey = `audio_part_${state.selectedTitle}_${partIndex}`;
        
        const cachedAudio = sessionStorage.getItem(cacheKey);
        if (cachedAudio) {
            setAudioState(prev => ({
                ...prev,
                [partIndex]: { isLoading: false, audioData: cachedAudio, error: null, progress: 100 }
            }));
            return;
        }

        setAudioState(prev => ({
            ...prev,
            [partIndex]: { isLoading: true, audioData: null, error: null, progress: 0 }
        }));

        try {
            const onProgress = (progress: number) => {
                setAudioState(prev => ({
                    ...prev,
                    [partIndex]: { ...prev[partIndex], isLoading: true, progress }
                }));
            };

            const audioData = await generateSpeech(text, 'Enceladus', onProgress);
            
            sessionStorage.setItem(cacheKey, audioData);

            setAudioState(prev => ({
                ...prev,
                [partIndex]: { isLoading: false, audioData, error: null, progress: 100 }
            }));
        } catch (e: any) {
            setAudioState(prev => ({
                ...prev,
                [partIndex]: { isLoading: false, audioData: null, error: e.message, progress: 0 }
            }));
        }
    };

    const handleNext = () => dispatch({ type: 'NEXT_STEP' });
    const handleBack = () => dispatch({ type: 'PREVIOUS_STEP' });

    return (
        <StepContainer
            title="Step 3: Generate High-Quality Audio"
            description="Generate professional, high-quality audio narration for each part of your story using the Gemini TTS model."
            onNext={handleNext}
            onBack={handleBack}
            isNextDisabled={!state.story}
        >
            {state.story ? (
                <div className="space-y-4">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                        <strong>New:</strong> Audio is now generated with a high-quality Gemini voice ("Enceladus") for a professional result. Click "Generate" for each part and then download the MP3.
                    </div>
                    {state.story.parts.map((part, index) => {
                        const partNumber = index + 1;
                        const currentPartState = audioState[partNumber];

                        return (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex-1 w-full">
                                    <h4 className="font-semibold text-lg text-gray-800">{part.title}</h4>
                                    <p className="text-gray-600 mt-1 text-sm line-clamp-2">{part.content}</p>
                                    <AudioErrorDisplay error={currentPartState?.error} />
                                </div>
                                <div className="flex-shrink-0 w-full sm:w-auto">
                                    {currentPartState?.isLoading ? (
                                        <div className="flex items-center justify-center w-full sm:w-36 h-10 px-4 bg-gray-100 rounded-md">
                                            <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            <span className="ml-2 text-sm">
                                                Generating ({Math.round(currentPartState.progress || 0)}%)
                                            </span>
                                        </div>
                                    ) : currentPartState?.audioData ? (
                                        <div className="flex items-center justify-center w-full sm:w-32 h-10 px-4 bg-green-100 rounded-md">
                                            <span className="text-sm font-medium text-green-800 mr-2">Ready</span>
                                            <DownloadButton
                                                data={currentPartState.audioData}
                                                filename={`story_part_${partNumber}.mp3`}
                                                contentType="audio/mpeg"
                                                isBase64={true}
                                            />
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleGenerateAudio(part.content, partNumber)}
                                            className="w-full sm:w-32 h-10 px-4 text-sm font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition-colors"
                                        >
                                            Generate Audio
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-gray-500">Generate a story in the previous step to create audio.</p>
            )}
        </StepContainer>
    );
};

export default Step3AudioGeneration;