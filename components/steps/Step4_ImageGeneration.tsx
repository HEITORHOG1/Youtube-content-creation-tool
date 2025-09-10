
import React, { useCallback, useEffect, useState } from 'react';
import { useWorkflowState } from '../../hooks/useWorkflowState';
import { generateImage } from '../../services/geminiService';
import StepContainer from '../StepContainer';
import DownloadButton from '../shared/DownloadButton';

// Add this type declaration for JSZip from the CDN
declare global {
  interface Window {
    JSZip: any;
  }
}

const ImageCard: React.FC<{ image: { id: string, base64: string, description: string, sequenceNumber: number } }> = ({ image }) => {
    return (
        <div className="group relative overflow-hidden rounded-lg shadow-md border border-gray-200">
            <img src={`data:image/jpeg;base64,${image.base64}`} alt={image.description} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-3 text-white">
                <span className="absolute top-2 left-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-xs font-bold">{image.sequenceNumber}</span>
                <p className="text-xs font-medium truncate">{image.description}</p>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DownloadButton data={image.base64} filename={`image_${image.sequenceNumber}.jpeg`} contentType="image/jpeg" isBase64={true} />
            </div>
        </div>
    );
};

const Step4ImageGeneration: React.FC = () => {
    const { state, dispatch } = useWorkflowState();
    const [isGenerating, setIsGenerating] = useState(false);
    const [isZipping, setIsZipping] = useState(false);

    const handleDownloadAll = async () => {
        if (!window.JSZip) {
            dispatch({ type: 'SET_ERROR', payload: 'Could not create zip file. JSZip library not found.' });
            return;
        }
        if (state.generatedImages.length === 0) {
            return;
        }
        
        setIsZipping(true);
        dispatch({ type: 'SET_ERROR', payload: null });
        try {
            const zip = new window.JSZip();
            state.generatedImages.forEach(image => {
                zip.file(`image_${image.sequenceNumber}.jpeg`, image.base64, { base64: true });
            });

            const content = await zip.generateAsync({ type: "blob" });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'generated_images.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

        } catch (e: any) {
            dispatch({ type: 'SET_ERROR', payload: `Failed to create zip file: ${e.message}` });
        } finally {
            setIsZipping(false);
        }
    };

    const handleGenerate = useCallback(async () => {
        if (!state.imageDescriptions.length || isGenerating) return;
        
        setIsGenerating(true);
        dispatch({ type: 'SET_ERROR', payload: null });
        
        for (let i = 0; i < state.imageDescriptions.length; i++) {
            const desc = state.imageDescriptions[i];
            // Skip if image already exists (e.g., after an error and restart)
            if (state.generatedImages.some(img => img.sequenceNumber === desc.sequence)) {
                continue;
            }
            try {
                dispatch({
                    type: 'SET_PROGRESS',
                    payload: {
                        message: `Generating image ${i + 1} of ${state.imageDescriptions.length}: "${desc.scene}"`,
                        percentage: ((i + 1) / state.imageDescriptions.length) * 100,
                    },
                });
                const imageData = await generateImage(desc.prompt);
                dispatch({
                    type: 'ADD_GENERATED_IMAGE',
                    payload: {
                        id: crypto.randomUUID(),
                        sequenceNumber: desc.sequence,
                        description: desc.scene,
                        base64: imageData,
                    },
                });
                // The Imagen API has a low requests-per-minute limit (~5 RPM for free tier).
                // This delay helps prevent 429 rate limit errors. Increased from 6.5s to 12.5s.
                await new Promise(resolve => setTimeout(resolve, 12500)); 
            } catch (e: any) {
                dispatch({ type: 'SET_ERROR', payload: `Failed to generate image ${i + 1}. ${e.message}` });
                setIsGenerating(false);
                dispatch({ type: 'SET_PROGRESS', payload: null });
                return;
            }
        }
        
        setIsGenerating(false);
        dispatch({ type: 'SET_PROGRESS', payload: null });
    }, [state.imageDescriptions, dispatch, isGenerating, state.generatedImages]);

    useEffect(() => {
        if (state.imageDescriptions.length > 0 && state.generatedImages.length < state.imageDescriptions.length) {
            handleGenerate();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.imageDescriptions]);

    const handleNext = () => dispatch({ type: 'NEXT_STEP' });
    const handleBack = () => dispatch({ type: 'PREVIOUS_STEP' });

    const allImagesGenerated = state.imageDescriptions.length > 0 && state.generatedImages.length === state.imageDescriptions.length;

    return (
        <StepContainer
            title="Step 5: Generate Images"
            description={`The AI is now generating all ${state.imageDescriptions.length || state.settings.numberOfDescriptions} images for your video. This is the longest step and may take several minutes.`}
            onNext={handleNext}
            onBack={handleBack}
            isNextDisabled={!allImagesGenerated || isGenerating}
            isBackDisabled={isGenerating}
        >
            {state.progress && (
                <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500">
                    <div className="flex justify-between mb-1">
                        <span className="text-base font-medium text-blue-700">Generation Progress</span>
                        <span className="text-sm font-medium text-blue-700">{Math.round(state.progress.percentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${state.progress.percentage}%` }}></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 truncate">{state.progress.message}</p>
                </div>
            )}
            
            {state.error && <div className="text-red-600 bg-red-100 p-3 rounded-md mb-4">{state.error}</div>}

            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                    Generated Images ({state.generatedImages.length} / {state.imageDescriptions.length || state.settings.numberOfDescriptions})
                </h3>
                {allImagesGenerated && (
                    <button
                        onClick={handleDownloadAll}
                        disabled={isZipping || isGenerating}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300 disabled:cursor-not-allowed flex items-center"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        {isZipping ? 'Zipping...' : 'Download All (.zip)'}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {state.generatedImages.map((img) => <ImageCard key={img.id} image={img} />)}
                {isGenerating && Array.from({ length: state.imageDescriptions.length - state.generatedImages.length }).map((_, i) => (
                    <div key={i} className="aspect-video bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"></path></svg>
                    </div>
                ))}
            </div>
        </StepContainer>
    );
};

export default Step4ImageGeneration;