
import React, { useCallback, useEffect, useState } from 'react';
import { useWorkflowState } from '../../hooks/useWorkflowState';
import { generateThumbnailDescription, generateImage } from '../../services/geminiService';
import { saveToSheet } from '../../services/googleSheetService';
import StepContainer from '../StepContainer';
import LoadingSpinner from '../shared/LoadingSpinner';
import RestartButton from '../RestartButton';
import DownloadButton from '../shared/DownloadButton';

const Step5ThumbnailCreation: React.FC = () => {
    const { state, dispatch } = useWorkflowState();
    const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<{success: boolean, message: string} | null>(null);


    const handleGenerateDescription = useCallback(async () => {
        if (!state.selectedTitle || !state.story?.summary) {
            dispatch({ type: 'SET_ERROR', payload: 'Title or story summary missing.' });
            return;
        }
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const description = await generateThumbnailDescription(state.selectedTitle, state.story.summary);
            dispatch({ type: 'SET_THUMBNAIL_DESCRIPTION', payload: description });
        } catch (e: any) {
            dispatch({ type: 'SET_ERROR', payload: e.message });
        }
    }, [state.selectedTitle, state.story?.summary, dispatch]);

    const handleGenerateImage = async () => {
        if (!state.thumbnailDescription) return;
        setIsGeneratingImage(true);
        setIsSaving(false);
        setSaveStatus(null);
        dispatch({type: 'SET_ERROR', payload: null});

        try {
            const imageData = await generateImage(state.thumbnailDescription);
            setThumbnailImage(imageData);
            
            setIsSaving(true);
            const result = await saveToSheet(state.sessionId, state.settings.sheetUrl, {
                 'descricao_tunbnail': state.thumbnailDescription,
                 'url-tunbnail': "Não aplicável. A miniatura é um arquivo local gerado no navegador.",
                 'url_imagens': `Não aplicável. O usuário baixou ${state.generatedImages.length} imagens como um arquivo .zip.`
            });
            setSaveStatus(result);
            setIsSaving(false);

        } catch (e: any) {
            const errorMessage = `Failed to generate or save. ${e.message}`;
            dispatch({ type: 'SET_ERROR', payload: errorMessage });
            setSaveStatus({ success: false, message: errorMessage });
        } finally {
            setIsGeneratingImage(false);
        }
    };

    useEffect(() => {
        if (!state.thumbnailDescription && state.selectedTitle && state.story?.summary) {
            handleGenerateDescription();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.selectedTitle, state.story?.summary]);

    const handleBack = () => dispatch({ type: 'PREVIOUS_STEP' });

    return (
        <StepContainer
            title="Step 7: Create Thumbnail & Finish"
            description="Your content package is complete! Here's a generated thumbnail suggestion. You can now download all your assets."
            onBack={handleBack}
            isBackDisabled={state.isLoading || isGeneratingImage || isSaving}
            showNext={false}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Thumbnail Suggestion</h3>
                    {state.isLoading && <LoadingSpinner message="Creating thumbnail prompt..." />}
                    {state.error && <div className="text-red-600 bg-red-100 p-3 rounded-md mb-4">{state.error}</div>}
                    {state.thumbnailDescription && !state.isLoading && (
                        <div className="space-y-4">
                            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                <p className="font-semibold text-gray-800">Generated Prompt:</p>
                                <p className="text-sm text-gray-600 mt-1">{state.thumbnailDescription}</p>
                            </div>
                            <button
                                onClick={handleGenerateImage}
                                disabled={isGeneratingImage || isSaving}
                                className="w-full px-6 py-2 font-semibold text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 disabled:cursor-not-allowed"
                            >
                                {isGeneratingImage ? 'Generating Image...' : (isSaving ? 'Saving data...' : 'Generate Thumbnail & Save Final Data')}
                            </button>
                            {isGeneratingImage && <LoadingSpinner message="Generating thumbnail..." />}
                            {thumbnailImage && (
                                <div className="mt-4 group relative">
                                    <img src={`data:image/jpeg;base64,${thumbnailImage}`} alt="Generated Thumbnail" className="rounded-lg shadow-lg w-full" />
                                     <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DownloadButton data={thumbnailImage} filename="thumbnail.jpeg" contentType="image/jpeg" isBase64={true} />
                                    </div>
                                </div>
                            )}
                             {isSaving && <div className="text-sm text-center text-gray-600 mt-2">Salvando dados finais na Planilha Google...</div>}
                             {saveStatus && saveStatus.success && (
                                <div className="text-sm text-center text-green-600 bg-green-50 p-2 rounded-md mt-2">
                                    ✓ Conteúdo salvo e atualizado com sucesso na sua Planilha Google!
                                </div>
                            )}
                            {saveStatus && !saveStatus.success && (
                                 <div className="text-sm text-center text-red-600 bg-red-50 p-2 rounded-md mt-2">
                                    {saveStatus.message}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Your Assets</h3>
                    <div className="p-4 border border-gray-200 rounded-lg bg-white space-y-3 max-h-[400px] overflow-y-auto">
                        <div className="font-semibold text-gray-700">Video Title: <span className="font-normal text-gray-900">{state.selectedTitle}</span></div>
                        <div className="font-semibold text-gray-700">Story: <span className="font-normal text-green-600">Generated & Ready</span></div>
                        <div className="font-semibold text-gray-700">Image Descriptions: <span className="font-normal text-green-600">{state.imageDescriptions.length} Generated</span></div>
                        <div className="font-semibold text-gray-700">Images: <span className="font-normal text-green-600">{state.generatedImages.length} / {state.imageDescriptions.length} Generated</span></div>
                        {state.youtubeDescription && <div className="font-semibold text-gray-700">SEO Description: <span className="font-normal text-green-600">Generated & Ready</span></div>}
                        <p className="text-sm text-gray-500 pt-2 border-t">You can download individual images from the previous step.</p>
                    </div>
                </div>
            </div>
            <RestartButton />
        </StepContainer>
    );
};

export default Step5ThumbnailCreation;