
import React from 'react';
import { useWorkflowState } from '../hooks/useWorkflowState';

const RestartButton: React.FC = () => {
  const { dispatch } = useWorkflowState();

  const handleRestart = () => {
    if (window.confirm("Are you sure you want to restart? All generated content will be lost.")) {
      dispatch({ type: 'RESET' });
    }
  };

  return (
    <div className="text-center mt-8">
      <button
        onClick={handleRestart}
        className="px-8 py-3 font-semibold text-white bg-red-600 border border-transparent rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all transform hover:scale-105"
      >
        Start Over
      </button>
    </div>
  );
};

export default RestartButton;
