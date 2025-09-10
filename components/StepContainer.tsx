
import React from 'react';

interface StepContainerProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  isNextDisabled?: boolean;
  isBackDisabled?: boolean;
  showNext?: boolean;
  showBack?: boolean;
}

const StepContainer: React.FC<StepContainerProps> = ({
  title,
  description,
  children,
  onNext,
  onBack,
  isNextDisabled = false,
  isBackDisabled = false,
  showNext = true,
  showBack = true,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h2>
        <p className="mt-2 text-base text-gray-600">{description}</p>
      </div>
      <div className="min-h-[200px]">{children}</div>
      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
        {showBack ? (
          <button
            onClick={onBack}
            disabled={isBackDisabled}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
        ) : <div />}
        {showNext ? (
          <button
            onClick={onNext}
            disabled={isNextDisabled}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
          >
            Next Step
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          </button>
        ) : <div />}
      </div>
    </div>
  );
};

export default StepContainer;
