import { useState } from "react";
import { useLocation } from "wouter";
import { X, Calendar, Plane, Building, Smartphone, HeartPulse, Banknote, ShoppingBag, Zap, Play, Leaf, BarChart, DollarSign } from "lucide-react";
import { BullMascot, BearMascot } from "@/components/mascot";
import type { UserProfile } from "@/pages/quiz";

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
    <div className="fixed inset-0 z-50" data-testid="quiz-modal">
      {/* Modal Background */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={handleClose}></div>
      
      {/* Modal Content */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden" style={{maxWidth: '375px'}}>
          
          {/* Progress Header */}
          <div className="px-6 pt-4 pb-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-center" data-testid="text-quiz-title" style={{fontFamily: 'DIN Alternate, sans-serif', fontSize: '30px', fontWeight: '700', lineHeight: '32px', letterSpacing: '0.10px', color: '#090909'}}>
                Your investing personality check
              </h2>
              <button 
                onClick={handleClose} 
                className="text-muted-foreground hover:text-foreground"
                data-testid="button-close-quiz"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mt-4" style={{background: '#E5E5E5'}}>
              <div 
                className="h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: '#57C30A' }}
                data-testid="progress-quiz"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2" data-testid="text-quiz-step">
              {currentStep} of 4
            </p>
          </div>
          
          {/* Quiz Steps */}
          <div className="px-7 py-4 space-y-6">
            
            {/* Bull Mascot - appears on all steps */}
            <div className="flex items-center mb-6">
              <div className="w-20 h-28 mr-4">
                <BullMascot size="quiz" className="w-full h-full" />
              </div>
              <div className="flex-1">
                {currentStep === 1 && (
                  <h3 className="text-2xl font-bold" style={{fontFamily: 'DIN Alternate, sans-serif', fontSize: '24px', fontWeight: '700', lineHeight: '16px', letterSpacing: '0.48px'}}>Your money goal?</h3>
                )}
                {currentStep === 2 && (
                  <h3 className="text-2xl font-bold" style={{fontFamily: 'DIN Alternate, sans-serif', fontSize: '24px', fontWeight: '700', lineHeight: '16px', letterSpacing: '0.48px'}}>What industries excite you?</h3>
                )}
                {currentStep === 3 && (
                  <h3 className="text-2xl font-bold" style={{fontFamily: 'DIN Alternate, sans-serif', fontSize: '24px', fontWeight: '700', lineHeight: '16px', letterSpacing: '0.48px'}}>Do you value social impact?</h3>
                )}
                {currentStep === 4 && (
                  <h3 className="text-2xl font-bold" style={{fontFamily: 'DIN Alternate, sans-serif', fontSize: '24px', fontWeight: '700', lineHeight: '16px', letterSpacing: '0.48px'}}>How much should you invest today?</h3>
                )}
              </div>
            </div>
            
            {/* Step 1: Money Goal */}
            {currentStep === 1 && (
              <div data-testid="quiz-step-1">
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
                <p className="text-sm text-muted-foreground mb-6">
                  Enter the amount you're comfortable investing to get personalized projections.
                </p>
                
                <div className="space-y-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="w-8 h-8 text-primary" />
                    </div>
                    
                    <div className="relative">
                      <input
                        type="number"
                        min="10"
                        max="1000000"
                        step="10"
                        value={profile.investmentAmount}
                        onChange={(e) => handleInvestmentAmountChange(Number(e.target.value))}
                        className="w-full text-2xl text-center py-4 px-6 border-2 rounded-lg bg-background focus:border-primary focus:outline-none transition-colors"
                        placeholder="10000"
                        data-testid="input-investment-amount"
                      />
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground pointer-events-none">
                        $
                      </div>
                    </div>
                    
                    <div className="mt-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        Minimum: $10 • Maximum: $1,000,000
                      </p>
                    </div>
                    
                    {/* Quick Amount Buttons */}
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {[1000, 5000, 10000, 25000, 50000, 100000].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => handleInvestmentAmountChange(amount)}
                          className={`p-2 text-sm border rounded-md hover:border-primary hover:bg-primary/5 transition-colors ${
                            profile.investmentAmount === amount ? 'border-primary bg-primary/10' : 'border-border'
                          }`}
                          data-testid={`button-amount-${amount}`}
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
          <div className="px-7 pb-6 pt-4">
            <div className="flex space-x-3">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="flex-1 bg-muted text-muted-foreground py-3 px-4 rounded-lg font-medium hover:bg-muted/80 transition-colors"
                  data-testid="button-quiz-back"
                >
                  Back
                </button>
              )}
              
              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1 bg-primary text-primary-foreground py-4 px-6 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors text-[16px]"
                  data-testid="button-quiz-next"
                  style={{fontFamily: 'Inter, sans-serif', letterSpacing: '0.15px'}}
                >
                  Keep Going
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  disabled={isLoading || !canProceed()}
                  className="flex-1 bg-secondary text-secondary-foreground py-3 px-4 rounded-lg font-medium hover:bg-secondary/90 transition-colors disabled:opacity-50"
                  data-testid="button-quiz-finish"
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
