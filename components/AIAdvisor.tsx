
import React, { useState } from 'react';
import { Sparkles, RefreshCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { FinancialAdvice } from '../services/geminiService';

interface AIAdvisorProps {
  advice: FinancialAdvice | string | null;
  isLoading: boolean;
  onRefresh: () => void;
  darkMode: boolean;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ advice, isLoading, onRefresh, darkMode }) => {
  const [currentStep, setCurrentStep] = useState(0);

  // If advice is a string, it means it failed to parse as JSON or it's the initial loading string
  const isStructured = typeof advice === 'object' && advice !== null;
  
  const tips = isStructured ? (advice as FinancialAdvice).tips : [];
  const intro = isStructured ? (advice as FinancialAdvice).intro : null;
  const closing = isStructured ? (advice as FinancialAdvice).closing : null;

  const handleNext = () => {
    setCurrentStep((prev) => (prev + 1) % tips.length);
  };

  const handlePrev = () => {
    setCurrentStep((prev) => (prev - 1 + tips.length) % tips.length);
  };

  return (
    <div className={`p-6 rounded-[2.5rem] shadow-xl border transition-all duration-500 overflow-hidden relative ${
      darkMode 
        ? 'bg-slate-900 border-slate-800 text-slate-100' 
        : 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-500/20'
    }`}>
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center backdrop-blur-md border ${
              darkMode ? 'bg-white/5 border-white/10' : 'bg-white/20 border-white/30'
            }`}>
              <Sparkles className={`w-5 h-5 ${darkMode ? 'text-indigo-400' : 'text-white'}`} />
            </div>
            <div>
              <h3 className="font-black text-lg tracking-tight uppercase">Advisor Inteligente</h3>
              <p className={`text-[10px] font-bold uppercase tracking-widest opacity-60`}>Insights by Gemini AI</p>
            </div>
          </div>
          <button 
            onClick={onRefresh} 
            disabled={isLoading} 
            className={`p-2.5 rounded-xl transition-all active:scale-90 ${
              darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <div className={`h-4 rounded-full w-3/4 animate-pulse ${darkMode ? 'bg-white/10' : 'bg-white/20'}`} />
            <div className={`h-24 rounded-3xl w-full animate-pulse ${darkMode ? 'bg-white/5' : 'bg-white/10'}`} />
            <div className={`h-4 rounded-full w-1/2 animate-pulse ${darkMode ? 'bg-white/10' : 'bg-white/20'}`} />
          </div>
        ) : !advice ? (
          <p className="text-sm font-medium opacity-80">Carregando seus insights financeiros...</p>
        ) : !isStructured ? (
          <div className={`p-5 rounded-3xl border ${
            darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/10 border-white/20'
          }`}>
            <p className="text-sm font-medium leading-relaxed">{advice as string}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {intro && (
              <p className="text-sm font-bold leading-relaxed opacity-90 italic">
                "{intro}"
              </p>
            )}

            {/* Tip Carousel Area */}
            <div className="relative">
              <div className={`min-h-[160px] p-6 rounded-[2rem] border transition-all duration-300 group ${
                darkMode ? 'bg-slate-800/40 border-slate-700 hover:border-indigo-500/30' : 'bg-white/10 border-white/20 hover:bg-white/15'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                    darkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/20 text-white'
                  }`}>
                    Dica {currentStep + 1} de {tips.length}
                  </span>
                </div>
                
                <h4 className="text-lg font-black mb-2 tracking-tight">
                  {tips[currentStep].title}
                </h4>
                <p className="text-sm font-medium leading-relaxed opacity-80">
                  {tips[currentStep].content}
                </p>

                {/* Navigation Arrows */}
                <div className="absolute inset-y-0 -left-3 -right-3 flex items-center justify-between pointer-events-none">
                  <button 
                    onClick={handlePrev}
                    className={`w-10 h-10 rounded-full flex items-center justify-center pointer-events-auto transition-all shadow-lg active:scale-95 ${
                      darkMode ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white text-indigo-600 hover:bg-slate-50'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleNext}
                    className={`w-10 h-10 rounded-full flex items-center justify-center pointer-events-auto transition-all shadow-lg active:scale-95 ${
                      darkMode ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white text-indigo-600 hover:bg-slate-50'
                    }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Progress Dots */}
              <div className="flex justify-center gap-2 mt-4">
                {tips.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentStep === idx 
                        ? (darkMode ? 'w-8 bg-indigo-500' : 'w-8 bg-white') 
                        : (darkMode ? 'w-1.5 bg-slate-700' : 'w-1.5 bg-white/30')
                    }`}
                  />
                ))}
              </div>
            </div>

            {closing && (
              <p className="text-xs font-black text-center uppercase tracking-widest opacity-60">
                {closing}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAdvisor;
