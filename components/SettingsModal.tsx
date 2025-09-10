
import React, { useState, useEffect } from 'react';
import { useWorkflowState } from '../hooks/useWorkflowState';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { state, dispatch } = useWorkflowState();
    const [numberOfDescriptions, setNumberOfDescriptions] = useState(state.settings.numberOfDescriptions);
    const [apiKey, setApiKey] = useState('');
    const [sheetUrl, setSheetUrl] = useState('');

    useEffect(() => {
        if (isOpen) {
            setNumberOfDescriptions(state.settings.numberOfDescriptions);
            const storedKey = sessionStorage.getItem('gemini_api_key') || process.env.API_KEY || '';
            setApiKey(storedKey);
            const storedSheetUrl = sessionStorage.getItem('google_sheet_url') || '';
            setSheetUrl(storedSheetUrl);
        }
    }, [isOpen, state.settings.numberOfDescriptions]);

    if (!isOpen) {
        return null;
    }

    const handleSave = () => {
        sessionStorage.setItem('gemini_api_key', apiKey);
        sessionStorage.setItem('google_sheet_url', sheetUrl);
        dispatch({ 
            type: 'UPDATE_SETTINGS', 
            payload: { 
                numberOfDescriptions: Number(numberOfDescriptions),
                sheetUrl: sheetUrl,
            } 
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                    <div>
                        <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">
                            1. Google API Key
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                            Enter your Google API key. You can create one for free at {' '}
                            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                Google AI Studio
                            </a>.
                        </p>
                        <input
                            type="password"
                            id="api-key"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter your API key here"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        />
                         <p className="text-xs text-gray-500 mt-2">
                            Note: The same Gemini API key works for all features in this tool (text, audio, and image generation).
                        </p>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <label htmlFor="sheet-url" className="block text-sm font-medium text-gray-700">
                           2. Google Apps Script URL (Optional)
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                           To automatically save your generated content, create a Google Apps Script and paste the deployed Web App URL here. See instructions in the prompt.
                        </p>
                        <input
                            type="url"
                            id="sheet-url"
                            value={sheetUrl}
                            onChange={(e) => setSheetUrl(e.target.value)}
                            placeholder="https://script.google.com/macros/s/.../exec"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        />
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <label htmlFor="descriptions-count" className="block text-sm font-medium text-gray-700">
                            3. Number of Images & Descriptions
                        </label>
                        <p className="text-xs text-gray-500 mb-2">How many images should be generated for the story? This will also determine the number of descriptions created.</p>
                        <input
                            type="number"
                            id="descriptions-count"
                            value={numberOfDescriptions}
                            onChange={(e) => setNumberOfDescriptions(Number(e.target.value))}
                            min="5"
                            max="25"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        />
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;