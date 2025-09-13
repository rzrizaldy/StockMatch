import { useState } from "react";
import { useLocation } from "wouter";
import { X, Shield, TrendingUp, Rocket, Smartphone, HeartPulse, Banknote, ShoppingBag, Zap, Play, Leaf, BarChart, DollarSign } from "lucide-react";
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
        return profile.risk !== '';
      case 2:
        return profile.industries.length > 0;
      case 3:
        return true; // ESG is optional
      case 4:
        return profile.investmentAmount >= 100; // Minimum $100
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
        <div className="bg-card rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
          
          {/* Progress Header */}
          <div className="p-6 border-b border-border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold" data-testid="text-quiz-title">
                Let's personalize your experience
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
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
                data-testid="progress-quiz"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2" data-testid="text-quiz-step">
              {currentStep} of 4
            </p>
          </div>
          
          {/* Quiz Steps */}
          <div className="p-6 space-y-6">
            
            {/* Step 1: Investment Style */}
            {currentStep === 1 && (
              <div data-testid="quiz-step-1">
                <h3 className="text-lg font-medium mb-4">What's your investment style?</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => handleRiskSelect('conservative')}
                    className={`w-full p-4 border rounded-lg text-left hover:border-primary hover:bg-primary/5 transition-colors ${
                      profile.risk === 'conservative' ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                    data-testid="button-risk-conservative"
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mr-4">
                        <Shield className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <div className="font-medium">Slow & Steady</div>
                        <div className="text-sm text-muted-foreground">Conservative, stable growth</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleRiskSelect('balanced')}
                    className={`w-full p-4 border rounded-lg text-left hover:border-primary hover:bg-primary/5 transition-colors ${
                      profile.risk === 'balanced' ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                    data-testid="button-risk-balanced"
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                        <TrendingUp className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">Balanced Growth</div>
                        <div className="text-sm text-muted-foreground">Mix of growth and stability</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleRiskSelect('aggressive')}
                    className={`w-full p-4 border rounded-lg text-left hover:border-primary hover:bg-primary/5 transition-colors ${
                      profile.risk === 'aggressive' ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                    data-testid="button-risk-aggressive"
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mr-4">
                        <Rocket className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <div className="font-medium">High Flyer</div>
                        <div className="text-sm text-muted-foreground">High growth potential</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 2: Industry Preferences */}
            {currentStep === 2 && (
              <div data-testid="quiz-step-2">
                <h3 className="text-lg font-medium mb-4">What industries excite you?</h3>
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
                <h3 className="text-lg font-medium mb-4">Do you value social impact?</h3>
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
                <h3 className="text-lg font-medium mb-4">How much would you like to invest today?</h3>
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
                        min="100"
                        max="1000000"
                        step="100"
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
                        Minimum: $100 • Maximum: $1,000,000
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
          <div className="p-6 border-t border-border">
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
                  className="flex-1 bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                  data-testid="button-quiz-next"
                >
                  Next
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
      </div>
    </div>
  );
}
