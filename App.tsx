
import React, { useState, useEffect } from 'react';
import { WorkflowProvider, useWorkflowState } from './hooks/useWorkflowState';
import WorkflowStepper from './components/WorkflowStepper';
import Step1TitleGeneration from './components/steps/Step1_TitleGeneration';
import Step2StoryCreation from './components/steps/Step2_StoryCreation';
import Step3AudioGeneration from './components/steps/Step3_AudioGeneration';
import Step3ImageDescriptions from './components/steps/Step3_ImageDescriptions';
import Step4ImageGeneration from './components/steps/Step4_ImageGeneration';
import Step5ThumbnailCreation from './components/steps/Step5_ThumbnailCreation';
import Step6YouTubeDescription from './components/steps/Step6YouTubeDescription';
import SettingsModal from './components/SettingsModal';

const AppContent: React.FC = () => {
    const { state } = useWorkflowState();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        // On initial load, check if the API key is set. If not, open the settings modal.
        const apiKey = sessionStorage.getItem('gemini_api_key');
        if (!apiKey) {
            setIsSettingsOpen(true);
        }
    }, []);

    const renderCurrentStep = () => {
        switch (state.currentStep) {
            case 1:
                return <Step1TitleGeneration />;
            case 2:
                return <Step2StoryCreation />;
            case 3:
                return <Step3AudioGeneration />;
            case 4:
                return <Step3ImageDescriptions />;
            case 5:
                return <Step4ImageGeneration />;
            case 6:
                return <Step6YouTubeDescription />;
            case 7:
                return <Step5ThumbnailCreation />;
            default:
                return <Step1TitleGeneration />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
            <header className="bg-white shadow-md sticky top-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10 15l5.19-3.11L10 8.79v6.42zm11.45-6.2c-.28-.98-1.09-1.79-2.07-2.07C17.92 6.5 12 6.5 12 6.5s-5.92 0-7.38.23c-.98.28-1.79 1.09-2.07 2.07C2.32 10.24 2.32 12 2.32 12s0 1.76.23 3.2c.28.98 1.09 1.79 2.07 2.07C6.08 17.5 12 17.5 12 17.5s5.92 0 7.38-.23c.98-.28-1.79-1.09-2.07-2.07.23-1.44.23-3.2.23-3.2s0-1.76-.23-3.2z"/>
                            </svg>
                            <h1 className="text-2xl font-bold text-gray-800">YouTube Content Creation Tool</h1>
                        </div>
                         <p className="text-sm text-gray-500 hidden sm:block absolute left-1/2 -translate-x-1/2">AI-Powered Video Workflow</p>
                        <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-gray-100 text-gray-600" aria-label="Open settings">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <WorkflowStepper />
                <div className="mt-8">
                    {renderCurrentStep()}
                </div>
            </main>
             <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <footer className="bg-white mt-12 py-4">
                <div className="text-center text-sm text-gray-500">
                    Powered by Google Gemini & Imagen APIs
                </div>
            </footer>
        </div>
    );
};


const App: React.FC = () => {
    return (
        <WorkflowProvider>
            <AppContent />
        </WorkflowProvider>
    );
};

export default App;