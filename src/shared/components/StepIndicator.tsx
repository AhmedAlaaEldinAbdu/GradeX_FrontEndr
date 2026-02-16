import React from 'react';

interface Step {
  id: number;
  label: string;
  icon: React.ReactNode;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <div className="mb-8 flex items-center justify-center px-8 py-6">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="relative flex flex-col items-center gap-3">
            {/* Step Circle */}
            <div
              className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full transition-all ${
                currentStep > step.id
                  ? 'bg-green-500 shadow-md'
                  : currentStep === step.id
                    ? 'border-2 border-green-500 bg-transparent'
                    : 'border-2 border-gray-300 bg-gray-100'
              }`}
            >
              {/* Show checkmark for completed steps, icon for current and future steps */}
              {currentStep > step.id ? (
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <div
                  className="text-green-500"
                  style={
                    currentStep === step.id
                      ? {
                          filter:
                            'brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(95%) contrast(101%)',
                        }
                      : {
                          filter: 'grayscale(100%) opacity(0.5)',
                        }
                  }
                >
                  {step.icon}
                </div>
              )}
            </div>

            {/* Step Label */}
            <span
              className={`whitespace-nowrap text-base font-normal ${currentStep === step.id ? 'font-semibold text-green-500' : 'text-gray-500'}`}
            >
              {step.label}
            </span>
          </div>

          {/* Connecting Line */}
          {index < steps.length - 1 && (
            <div
              className={`mx-6 mb-8 h-[2px] flex-1 transition-all ${
                currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
              }`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;
