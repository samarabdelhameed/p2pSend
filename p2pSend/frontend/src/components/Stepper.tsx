import { Check } from 'lucide-react';

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-700">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={step} className="flex flex-col items-center relative z-10">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300
                  ${isCompleted ? 'bg-primary text-white' : ''}
                  ${isActive ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/50' : ''}
                  ${!isActive && !isCompleted ? 'bg-slate-700 text-slate-400' : ''}
                `}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
              </div>
              <span
                className={`
                  mt-2 text-sm font-medium transition-colors
                  ${isActive ? 'text-primary' : 'text-slate-400'}
                `}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
