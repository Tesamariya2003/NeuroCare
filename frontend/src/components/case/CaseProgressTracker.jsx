import React from 'react';

const steps = [
  "Case Submitted",
  "Select Test",
  "Instructions",
  "Upload Test",
  "Final Report"
];

const CaseProgressTracker = ({ currentStep }) => {
  // We subtract 1 because index is 0-based
  const progressWidth = (currentStep / (steps.length - 1)) * 100;

  return (
    <div className="relative w-full mb-12 px-4"> {/* Added px-4 to prevent circles hitting edges */}
      
      {/* 1. THE CONNECTOR LINE (Placed behind the circles) */}
      <div className="absolute top-5 left-10 right-10 h-[2px] bg-gray-100 z-0">
        <div 
          className="h-full bg-blue-600 transition-all duration-700 ease-in-out"
          style={{ width: `${Math.min(progressWidth, 100)}%` }}
        ></div>
      </div>

      {/* 2. THE CIRCLES AND LABELS */}
      <div className="flex items-center justify-between w-full relative z-10">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 border-2
              ${
                index <= currentStep
                  ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100"
                  : "bg-white border-gray-300 text-gray-400"
              }`}
            >
              {index < currentStep ? "✓" : index + 1}
            </div>
            
            <p className={`text-[10px] font-bold mt-3 uppercase tracking-wider whitespace-nowrap
              ${index <= currentStep ? "text-blue-600" : "text-gray-400"}`}>
              {step}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseProgressTracker;