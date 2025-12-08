import { motion } from 'framer-motion';

interface Step {
  id: number;
  title: string;
  emoji: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      {/* Desktop: Horizontal Progress Bar */}
      <div className="hidden md:block">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="absolute inset-y-0 left-0 bg-linear-to-r from-primary-500 to-primary-600 rounded-full"
            />
          </div>
          
          {/* Step Labels */}
          <div className="flex justify-between items-start">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center" style={{ width: `${100 / steps.length}%` }}>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: currentStep === step.id ? 1.1 : 1,
                    opacity: 1
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mb-2 transition-all duration-300 ${
                    currentStep >= step.id
                      ? 'bg-linear-to-br from-primary-500 to-primary-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {currentStep > step.id ? '✓' : step.emoji}
                </motion.div>
                <div className={`text-xs font-semibold text-center ${
                  currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.title}
                </div>
                <div className={`text-[10px] text-center mt-0.5 ${
                  currentStep >= step.id ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {step.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: Current Step Card */}
      <div className="md:hidden">
        <div className="bg-linear-to-r from-primary-50 to-purple-50 rounded-2xl p-4 border border-primary-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center text-xl font-bold shadow-lg">
                {steps[currentStep - 1].emoji}
              </div>
              <div>
                <div className="text-sm text-primary-600 font-medium">Step {currentStep} of {steps.length}</div>
                <div className="text-lg font-black text-gray-900">{steps[currentStep - 1].title}</div>
              </div>
            </div>
          </div>
          <div className="h-1.5 bg-white rounded-full overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
