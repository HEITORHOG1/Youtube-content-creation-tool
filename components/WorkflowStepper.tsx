
import React from 'react';
import { useWorkflowState } from '../hooks/useWorkflowState';

const steps = [
  "Title Generation",
  "Story Creation",
  "Audio Generation",
  "Image Descriptions",
  "Image Generation",
  "SEO Description",
  "Thumbnail & Finish"
];

const WorkflowStepper: React.FC = () => {
  const { state } = useWorkflowState();
  const currentStep = state.currentStep;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-0">
      <div className="relative">
        <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
        <div 
          className="absolute left-0 top-1/2 w-full h-0.5 bg-blue-600 transform -translate-y-1/2 transition-all duration-500" 
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>
        <div className="flex justify-between items-center relative">
          {steps.map((label, index) => {
            const stepIndex = index + 1;
            const isCompleted = stepIndex < currentStep;
            const isActive = stepIndex === currentStep;

            return (
              <div key={label} className="flex flex-col items-center text-center w-28">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : isActive
                      ? 'bg-white border-blue-600 text-blue-600 scale-110'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  ) : (
                    stepIndex
                  )}
                </div>
                <p
                  className={`mt-2 text-xs font-semibold transition-colors duration-300 ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkflowStepper;