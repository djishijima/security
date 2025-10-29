
import React, { useState, useEffect, useRef } from 'react';
import { OnboardingStep, View } from '../types';

interface OnboardingGuideProps {
  steps: OnboardingStep[];
  isOpen: boolean;
  onClose: () => void;
  setActiveView: (view: View) => void;
}

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ steps, isOpen, onClose, setActiveView }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStep];

  useEffect(() => {
    if (!isOpen) return;

    const navigateIfNeeded = async () => {
        if (step.navigateTo) {
            setActiveView(step.navigateTo);
            // Wait for the view to re-render
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    };
    
    navigateIfNeeded().then(() => {
        if (step.selector) {
            const element = document.querySelector(step.selector) as HTMLElement;
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Give it time to scroll
                setTimeout(() => {
                    setTargetRect(element.getBoundingClientRect());
                }, 300);
            } else {
                console.warn(`Onboarding selector not found: ${step.selector}`);
                setTargetRect(null); // No element to highlight
            }
        } else {
            setTargetRect(null); // It's a modal-style step
        }
    });

  }, [currentStep, isOpen, step, setActiveView]);


  if (!isOpen) return null;

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const next = () => {
    if (!isLastStep) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prev = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const getTooltipPosition = () => {
    if (!targetRect || !tooltipRef.current) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const { top, left, width, height } = targetRect;
    const tooltipHeight = tooltipRef.current.offsetHeight;
    const spaceBelow = window.innerHeight - top - height;

    if (spaceBelow > tooltipHeight + 20) {
      // Position below the element
      return { top: `${top + height + 10}px`, left: `${left + width / 2}px`, transform: 'translateX(-50%)' };
    } else {
      // Position above the element
      return { top: `${top - tooltipHeight - 10}px`, left: `${left + width / 2}px`, transform: 'translateX(-50%)' };
    }
  };
  
  const isModalStep = !step.selector;

  return (
    <>
      <div className="onboarding-overlay" onClick={isModalStep ? undefined : onClose} />
      
      {targetRect && (
        <div 
          className="onboarding-highlight"
          style={{
            width: `${targetRect.width + 10}px`,
            height: `${targetRect.height + 10}px`,
            top: `${targetRect.top - 5}px`,
            left: `${targetRect.left - 5}px`,
          }}
        />
      )}
      
      <div
        ref={tooltipRef}
        className={`onboarding-tooltip ${isModalStep ? '' : 'absolute'}`}
        style={isModalStep ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } : getTooltipPosition()}
      >
        <div className="bg-slate-700 rounded-lg shadow-2xl p-6 w-80 border border-slate-600 fade-in">
          <h3 className="text-lg font-bold text-blue-300 mb-2">{step.title}</h3>
          <p className="text-sm text-slate-300 mb-4">{step.content}</p>
          
          <div className="flex justify-between items-center">
             <span className="text-xs text-slate-400">{currentStep + 1} / {steps.length}</span>
             <div>
                {!isFirstStep && (
                     <button onClick={prev} className="text-sm text-slate-300 hover:text-white mr-4">戻る</button>
                )}
                 <button 
                     onClick={next}
                     className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm"
                 >
                     {isLastStep ? '完了' : '次へ'}
                 </button>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingGuide;