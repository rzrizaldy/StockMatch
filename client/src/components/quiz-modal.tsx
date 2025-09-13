import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Calendar, Plane, Building, Smartphone, HeartPulse, Banknote, ShoppingBag, Zap, Play, Leaf, BarChart, DollarSign } from "lucide-react";
import { BullMascot } from "@/components/mascot";
import type { UserProfile } from "@/pages/quiz";
import bearIcon from '@assets/image_1757791809801.png';

interface QuizModalProps {
  onComplete: (profile: UserProfile) => void;
  isLoading?: boolean;
}

export default function QuizModal({ onComplete, isLoading }: QuizModalProps) {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    risk: '',
    industries: [],
    esg: false,
    investmentAmount: 10000
  });

  const handleClose = () => {
    setLocation('/');
  };

  const handleRiskSelect = (risk: string) => {
    setProfile(prev => ({ ...prev, risk }));
  };

  const handleIndustryToggle = (industry: string) => {
    setProfile(prev => ({
      ...prev,
      industries: prev.industries.includes(industry)
        ? prev.industries.filter(i => i !== industry)
        : [...prev.industries, industry]
    }));
  };

  const handleESGSelect = (esg: boolean) => {
    setProfile(prev => ({ ...prev, esg }));
  };

  const handleInvestmentAmountChange = (amount: number) => {
    setProfile(prev => ({ ...prev, investmentAmount: amount }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    onComplete(profile);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return profile.risk !== '' && ['short-term', 'medium-term', 'long-term'].includes(profile.risk);
      case 2:
        return profile.industries.length > 0;
      case 3:
        return true; // ESG is optional
      case 4:
        return profile.investmentAmount >= 10; // Minimum $10
      default:
        return false;
    }
  };

  const progress = (currentStep / 4) * 100;

  const industries = [
    { id: 'tech', name: 'Technology', icon: Smartphone, color: 'text-primary' },
    { id: 'healthcare', name: 'Healthcare', icon: HeartPulse, color: 'text-secondary' },
    { id: 'finance', name: 'Finance', icon: Banknote, color: 'text-accent' },
    { id: 'consumer', name: 'Consumer', icon: ShoppingBag, color: 'text-chart-4' },
    { id: 'energy', name: 'Energy', icon: Zap, color: 'text-secondary' },
    { id: 'entertainment', name: 'Media', icon: Play, color: 'text-chart-5' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" data-testid="quiz-modal" style={{
      background: 'linear-gradient(180deg, #57C30A 0%, white 86%)'
    }}>
      <div className="min-h-full py-4 pb-safe">
        {/* Header with back button and title */}
        <div className="px-6 pt-5 pb-0">
          {/* Back button */}
          <div className="mb-8">
            <button 
              onClick={currentStep === 1 ? handleClose : handleBack}
              className="w-10 h-10 bg-black/30 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-black/40 transition-colors"
              data-testid="button-back-quiz"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          </div>
          
          {/* Title */}
          <div className="mb-8 max-w-[250px]">
            <div className="flex items-center gap-3 mb-6">
              <h1 className="text-white text-[30px] font-din font-bold leading-8 tracking-[0.1px] text-left" 
                  style={{fontFamily: 'DIN Alternate, sans-serif'}}>
                Your investing personality check
              </h1>
              <img 
                src={bearIcon} 
                alt="Bear Icon" 
                className="w-12 h-12"
                data-testid="bear-icon-personality"
              />
            </div>
          </div>
        </div>
        
        {/* Main content card */}
        <div className="px-6 pb-6">
          <div className="bg-white rounded-2xl shadow-lg mx-auto relative" style={{maxWidth: '375px'}}>
            {/* Mascot positioned outside card */}
            <div className="absolute top-10 right-6" style={{zIndex: 10}}>
              <div className="w-24 h-32">
                <BullMascot size="quiz" className="w-full h-full" />
              </div>
            </div>
            
            {/* Progress Bar inside card */}
            <div className="px-5 pt-4 pb-2">
              <div className="w-full bg-gray-200 rounded-full h-3" style={{background: '#E5E5E5'}}>
                <div 
                  className="h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, background: '#57C30A' }}
                  data-testid="progress-quiz"
                />
              </div>
            </div>
            
            {/* Quiz Steps */}
            <div className="px-5 py-6 space-y-6">
              {/* Step 1: Money Goal */}
              {currentStep === 1 && (
                <div data-testid="quiz-step-1">
                  <h4 className="text-black text-[20px] font-bold mb-6 font-din leading-7 tracking-[0.4px]" style={{fontFamily: 'DIN Alternate, sans-serif'}}>Your money goal?</h4>
                  <div className="space-y-4">
                    <button
                      onClick={() => handleRiskSelect('short-term')}
                      className={`w-full px-4 py-3 border rounded-lg text-left hover:border-primary/55 transition-colors ${
                        profile.risk === 'short-term' ? 'border-primary/55 outline outline-1 outline-primary/55' : 'border-primary/20'
                      }`}
                      data-testid="button-goal-short-term"
                    >
                      <div className="flex items-center">
                        <div className="w-6 h-6 mr-4 flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-primary" strokeWidth={1.5} />
                        </div>
                        <div>
                          <div className="font-normal text-[15px] text-[#322F35]" style={{fontFamily: 'Inter, sans-serif', letterSpacing: '0.30px'}}>Short-term treats</div>
                          <div className="text-[13px] text-[#8E8E93]" style={{fontFamily: 'Inter, sans-serif', letterSpacing: '0.26px'}}>Around 1 year</div>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleRiskSelect('medium-term')}
                      className={`w-full px-4 py-3 border rounded-lg text-left hover:border-primary/55 transition-colors ${
                        profile.risk === 'medium-term' ? 'border-primary/55 outline outline-1 outline-primary/55' : 'border-primary/20'
                      }`}
                      data-testid="button-goal-medium-term"
                    >
                      <div className="flex items-center">
                        <div className="w-6 h-6 mr-4 flex items-center justify-center">
                          <Plane className="w-6 h-6 text-primary" strokeWidth={1.5} />
                        </div>
                        <div>
                          <div className="font-normal text-[15px] text-[#322F35]" style={{fontFamily: 'Inter, sans-serif', letterSpacing: '0.30px'}}>Medium dreams</div>
                          <div className="text-[13px] text-[#8E8E93]" style={{fontFamily: 'Inter, sans-serif', letterSpacing: '0.26px'}}>Around 3 years</div>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleRiskSelect('long-term')}
                      className={`w-full px-4 py-3 border rounded-lg text-left hover:border-primary/55 transition-colors ${
                        profile.risk === 'long-term' ? 'border-primary/55 outline outline-1 outline-primary/55' : 'border-primary/20'
                      }`}
                      data-testid="button-goal-long-term"
                    >
                      <div className="flex items-center">
                        <div className="w-6 h-6 mr-4 flex items-center justify-center">
                          <Building className="w-6 h-6 text-primary" strokeWidth={1.5} />
                        </div>
                        <div>
                          <div className="font-normal text-[15px] text-[#322F35]" style={{fontFamily: 'Inter, sans-serif', letterSpacing: '0.30px'}}>Big future plans</div>
                          <div className="text-[13px] text-[#8E8E93]" style={{fontFamily: 'Inter, sans-serif', letterSpacing: '0.26px'}}>5+ years</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
              
              {/* Step 2: Industry Preferences */}
              {currentStep === 2 && (
                <div data-testid="quiz-step-2">
                  <h4 className="text-black text-[20px] font-bold mb-6 font-din leading-7 tracking-[0.4px]" style={{fontFamily: 'DIN Alternate, sans-serif'}}>What industries excite you?</h4>
                  <p className="text-sm text-muted-foreground mb-4">Select all that interest you</p>
                  <div className="grid grid-cols-2 gap-3">
                    {industries.map((industry) => {
                      const Icon = industry.icon;
                      const isSelected = profile.industries.includes(industry.id);
                      
                      return (
                        <button
                          key={industry.id}
                          onClick={() => handleIndustryToggle(industry.id)}
                          className={`p-4 border rounded-lg text-center hover:border-primary hover:bg-primary/5 transition-colors ${
                            isSelected ? 'border-primary bg-primary/10' : 'border-border'
                          }`}
                          data-testid={`button-industry-${industry.id}`}
                        >
                          <div className={`w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2`}>
                            <Icon className={`w-5 h-5 ${industry.color}`} />
                          </div>
                          <div className="font-medium text-sm">{industry.name}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Step 3: ESG Preferences */}
              {currentStep === 3 && (
                <div data-testid="quiz-step-3">
                  <h4 className="text-black text-[20px] font-bold mb-6 font-din leading-7 tracking-[0.4px]" style={{fontFamily: 'DIN Alternate, sans-serif'}}>Do you value social impact?</h4>
                  <p className="text-sm text-muted-foreground mb-6">
                    Would you like us to prioritize companies with strong environmental, social, and governance practices?
                  </p>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => handleESGSelect(true)}
                      className={`w-full p-4 border rounded-lg text-left hover:border-primary hover:bg-primary/5 transition-colors ${
                        profile.esg === true ? 'border-primary bg-primary/10' : 'border-border'
                      }`}
                      data-testid="button-esg-yes"
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mr-4">
                          <Leaf className="w-6 h-6 text-secondary" />
                        </div>
                        <div>
                          <div className="font-medium">Yes, prioritize ESG</div>
                          <div className="text-sm text-muted-foreground">Focus on sustainable companies</div>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleESGSelect(false)}
                      className={`w-full p-4 border rounded-lg text-left hover:border-primary hover:bg-primary/5 transition-colors ${
                        profile.esg === false ? 'border-primary bg-primary/10' : 'border-border'
                      }`}
                      data-testid="button-esg-no"
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                          <BarChart className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">Focus on returns</div>
                          <div className="text-sm text-muted-foreground">Prioritize financial performance</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
              
              {/* Step 4: Investment Amount */}
              {currentStep === 4 && (
                <div data-testid="quiz-step-4">
                  <h4 className="text-black text-[20px] font-bold mb-8 font-din leading-7 tracking-[0.4px]" 
                      style={{fontFamily: 'DIN Alternate, sans-serif'}}>How much are you <br/>starting with?</h4>
                  
                  <div className="space-y-6">
                    {/* Custom input field matching Figma */}
                    <div className="relative">
                      <div className="w-full p-6 rounded-xl border border-[#BACBB6] border-opacity-55 flex items-end gap-2">
                        <div className="text-black text-[40px] font-normal leading-10 tracking-[0.8px]" 
                             style={{fontFamily: 'Inter, sans-serif'}}>$</div>
                        <input
                          type="number"
                          min="10"
                          max="1000000"
                          step="10"
                          value={profile.investmentAmount === 10000 ? '' : profile.investmentAmount}
                          onChange={(e) => handleInvestmentAmountChange(Number(e.target.value) || 10)}
                          className="flex-1 text-[40px] font-normal leading-10 tracking-[0.8px] bg-transparent border-0 border-b border-[#BBCBB6] focus:outline-none focus:border-[#57C30A] text-black"
                          placeholder=""
                          data-testid="input-investment-amount"
                          style={{fontFamily: 'Inter, sans-serif'}}
                        />
                      </div>
                      
                      {/* Quick Amount Buttons */}
                      <div className="flex flex-wrap gap-3 mt-6">
                        {[100, 250, 500, 1000].map((amount) => (
                          <button
                            key={amount}
                            onClick={() => handleInvestmentAmountChange(amount)}
                            className="px-2 py-1 rounded-2xl border border-gray-500 border-opacity-55 hover:border-[#57C30A] hover:bg-[#57C30A]/5 transition-colors"
                            data-testid={`button-amount-${amount}`}
                            style={{
                              color: 'black',
                              fontSize: '12px',
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: '400',
                              lineHeight: '16px',
                              letterSpacing: '1.44px'
                            }}
                          >
                            ${amount.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="px-5 pb-6 pt-8">
              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="w-full py-4 px-6 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4BAE08] transition-colors text-white text-[16px]"
                  data-testid="button-quiz-next"
                  style={{
                    background: '#57C30A',
                    fontFamily: 'Inter, sans-serif', 
                    fontWeight: '500',
                    lineHeight: '24px',
                    letterSpacing: '0.15px'
                  }}
                >
                  Keep Going
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  disabled={isLoading || !canProceed()}
                  className="w-full py-4 px-6 rounded-full font-medium hover:bg-[#4BAE08] transition-colors disabled:opacity-50 text-white"
                  data-testid="button-quiz-finish"
                  style={{
                    background: '#57C30A',
                    fontFamily: 'Inter, sans-serif', 
                    fontWeight: '500',
                    lineHeight: '24px',
                    letterSpacing: '0.15px'
                  }}
                >
                  {isLoading ? 'Finding Matches...' : 'Find My Matches'}
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
              <h3 className="text-lg font-semibold">Finding your matches...</h3>
              <p className="text-muted-foreground">Analyzing your preferences</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}