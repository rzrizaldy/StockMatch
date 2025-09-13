import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Settings, Heart, X, CheckCircle, Trophy, Target, Zap, Star } from "lucide-react";
import StockCard from "@/components/stock-card";
import type { StockCard as StockCardType } from "@shared/schema";

export default function Swipe() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [likedStocks, setLikedStocks] = useState<string[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const [progressAnimation, setProgressAnimation] = useState(false);

  useEffect(() => {
    const storedSessionId = sessionStorage.getItem('stockmatch_session');
    if (!storedSessionId) {
      setLocation('/');
      return;
    }
    setSessionId(storedSessionId);
  }, [setLocation]);

  const { data: stockCards = [], isLoading, error } = useQuery({
    queryKey: ['/api/get-stock-deck', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      
      try {
        // Fetch the actual saved user profile
        const userProfile = await api.getUserProfile(sessionId);
        
        // Use the real profile data to get personalized stock deck
        const profile = {
          sessionId,
          risk: userProfile.risk,
          industries: userProfile.industries || [],
          esg: userProfile.esg || false
        };
        
        return api.getStockDeck(profile);
      } catch (error) {
        console.error('Failed to fetch user profile, using defaults:', error);
        // Fallback to defaults only if profile fetch fails
        const fallbackProfile = {
          sessionId,
          risk: 'balanced',
          industries: ['tech'],
          esg: false
        };
        
        return api.getStockDeck(fallbackProfile);
      }
    },
    enabled: !!sessionId,
  });

  const savePortfolioMutation = useMutation({
    mutationFn: async (likedStocks: string[]) => {
      if (!sessionId) throw new Error('No session ID');
      
      return api.savePortfolio({
        sessionId,
        likedStocks,
        totalValue: "10000"
      });
    },
    onSuccess: () => {
      setLocation('/portfolio');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save your portfolio. Please try again.",
        variant: "destructive"
      });
      console.error('Portfolio save error:', error);
    }
  });

  useEffect(() => {
    if (showInstructions) {
      const timer = setTimeout(() => setShowInstructions(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showInstructions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handleSwipeLeft();
      } else if (e.key === 'ArrowRight') {
        handleSwipeRight();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCardIndex, stockCards.length]);

  const handleSwipeLeft = () => {
    nextCard();
  };

  const handleSwipeRight = () => {
    if (stockCards[currentCardIndex]) {
      const ticker = stockCards[currentCardIndex].ticker;
      const updatedLikedStocks = [...likedStocks, ticker];
      setLikedStocks(updatedLikedStocks);
      nextCard(updatedLikedStocks);
    } else {
      nextCard(likedStocks);
    }
  };

  const nextCard = (currentLikedStocks = likedStocks) => {
    const nextIndex = currentCardIndex + 1;
    setCurrentCardIndex(nextIndex);
    
    // Trigger progress animation for visual feedback
    setProgressAnimation(true);
    setTimeout(() => setProgressAnimation(false), 600);
    
    if (nextIndex >= stockCards.length) {
      // All cards swiped, save portfolio with the most up-to-date liked stocks
      setTimeout(() => {
        savePortfolioMutation.mutate(currentLikedStocks);
      }, 500);
    }
  };

  const progress = stockCards.length > 0 ? (currentCardIndex / stockCards.length) * 100 : 0;
  const remainingCards = Math.max(0, stockCards.length - currentCardIndex);
  const completedCards = currentCardIndex;
  const totalCards = stockCards.length;
  
  // Gamified progress levels
  const getProgressLevel = (progress: number) => {
    if (progress >= 100) return { level: 'Champion', icon: Trophy, color: 'text-yellow-500', bgColor: 'bg-yellow-500' };
    if (progress >= 75) return { level: 'Expert', icon: Star, color: 'text-purple-500', bgColor: 'bg-purple-500' };
    if (progress >= 50) return { level: 'Rising', icon: Zap, color: 'text-blue-500', bgColor: 'bg-blue-500' };
    if (progress >= 25) return { level: 'Explorer', icon: Target, color: 'text-green-500', bgColor: 'bg-green-500' };
    return { level: 'Starter', icon: Heart, color: 'text-pink-500', bgColor: 'bg-pink-500' };
  };
  
  const currentLevel = getProgressLevel(progress);
  const LevelIcon = currentLevel.icon;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-6 bg-background">
        <div className="text-center space-y-6 fade-in">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-semibold" data-testid="text-loading">Finding your matches...</h2>
          <p className="text-muted-foreground">
            We're curating the perfect stocks based on your preferences
          </p>
          <div className="w-48 bg-muted rounded-full h-2 mx-auto">
            <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-6 bg-background">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-destructive rounded-full flex items-center justify-center mx-auto">
            <X className="w-8 h-8 text-destructive-foreground" />
          </div>
          <h2 className="text-2xl font-semibold text-destructive" data-testid="text-error">
            Failed to load stocks
          </h2>
          <p className="text-muted-foreground">
            Please check your internet connection and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium"
            data-testid="button-retry"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Gamified Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-semibold" data-testid="text-app-title">StockMatch</h1>
              {/* Gamified Level Badge */}
              <div className="flex items-center space-x-2">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${currentLevel.bgColor}/10 border border-current ${currentLevel.color}`}>
                  <LevelIcon className="w-3 h-3" />
                  <span className="text-xs font-bold">{currentLevel.level}</span>
                </div>
              </div>
            </div>
            <button className="text-muted-foreground hover:text-foreground" data-testid="button-settings">
              <Settings className="w-5 h-5" />
            </button>
          </div>
          
          {/* Enhanced Progress Section */}
          <div className="mt-4 space-y-2">
            {/* Progress Stats */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-foreground" data-testid="text-progress-stats">
                  {completedCards} of {totalCards} completed
                </span>
                <div className={`w-2 h-2 rounded-full ${currentLevel.bgColor} ${progressAnimation ? 'animate-ping' : ''}`} />
              </div>
              <div className="text-muted-foreground" data-testid="text-cards-remaining">
                {remainingCards} remaining
              </div>
            </div>
            
            {/* Enhanced Progress Bar */}
            <div className="relative">
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ease-out ${currentLevel.bgColor} ${progressAnimation ? 'animate-pulse' : ''}`}
                  style={{ width: `${progress}%` }}
                  data-testid="progress-swipe"
                />
                {/* Shine effect */}
                <div className={`absolute top-0 left-0 h-3 w-8 bg-white/20 rounded-full transition-transform duration-1000 ${progressAnimation ? 'translate-x-full' : '-translate-x-full'}`} />
              </div>
              {/* Progress milestones */}
              <div className="absolute top-0 left-0 w-full h-3 flex items-center justify-between px-1">
                {[25, 50, 75].map((milestone) => (
                  <div
                    key={milestone}
                    className={`w-1 h-1 rounded-full transition-colors duration-300 ${
                      progress >= milestone ? 'bg-white' : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {/* Motivational Message */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                {progress < 25 && "🚀 Great start! Keep exploring"}
                {progress >= 25 && progress < 50 && "⭐ You're on fire! Keep going"}
                {progress >= 50 && progress < 75 && "🎯 Almost there! You're doing amazing"}
                {progress >= 75 && progress < 100 && "🏆 Final push! You've got this"}
                {progress >= 100 && "🎉 Daily goal complete! Amazing work!"}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Swipe Instructions */}
      {showInstructions && (
        <div className="px-6 py-3 text-center border-b border-border bg-gradient-to-r from-secondary/5 to-primary/5" data-testid="instructions-swipe">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2 text-secondary">
              <div className="p-1 rounded-full bg-secondary/10">
                <Heart className="w-3 h-3 fill-current" />
              </div>
              <span className="font-medium">Swipe right to invest</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center space-x-2 text-destructive">
              <div className="p-1 rounded-full bg-destructive/10">
                <X className="w-3 h-3" />
              </div>
              <span className="font-medium">Swipe left to pass</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Card Stack Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="relative w-full max-w-md h-[600px]">
          {currentCardIndex >= stockCards.length ? (
            <div className="text-center space-y-6" data-testid="state-no-cards">
              {/* Daily Goal Complete Celebration */}
              <div className="relative">
                {/* Main Trophy */}
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto animate-bounce shadow-lg">
                  <Trophy className="w-12 h-12 text-yellow-900" />
                </div>
                {/* Particle Effects */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`absolute animate-ping`}
                      style={{
                        animation: `ping 1s ease-out ${i * 0.1}s infinite`,
                        transform: `rotate(${i * 60}deg) translateX(40px)`,
                      }}
                    >
                      <Star className={`w-4 h-4 text-yellow-400 fill-current`} />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-foreground animate-pulse">Daily Goal Complete! 🎉</h3>
                <p className="text-lg text-secondary font-medium">Amazing work, investor!</p>
                <p className="text-muted-foreground">
                  You've reviewed {totalCards} stocks and selected {likedStocks.length} for your portfolio
                </p>
              </div>
              
              {/* Achievement Badge */}
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-full">
                <Trophy className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Portfolio Builder</span>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full">
              {/* Current Card */}
              {stockCards[currentCardIndex] && (
                <StockCard
                  key={currentCardIndex}
                  stock={stockCards[currentCardIndex]}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                  style={{ zIndex: 30 }}
                />
              )}
              
              {/* Next Cards (preview) */}
              {stockCards[currentCardIndex + 1] && (
                <div
                  className="absolute top-0 left-0 w-full h-full transform scale-95 opacity-90"
                  style={{ zIndex: 20, pointerEvents: 'none' }}
                >
                  <StockCard
                    stock={stockCards[currentCardIndex + 1]}
                    onSwipeLeft={() => {}}
                    onSwipeRight={() => {}}
                  />
                </div>
              )}
              
              {stockCards[currentCardIndex + 2] && (
                <div
                  className="absolute top-0 left-0 w-full h-full transform scale-90 opacity-80"
                  style={{ zIndex: 10, pointerEvents: 'none' }}
                >
                  <StockCard
                    stock={stockCards[currentCardIndex + 2]}
                    onSwipeLeft={() => {}}
                    onSwipeRight={() => {}}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      {currentCardIndex < stockCards.length && (
        <div className="px-6 pb-8">
          <div className="flex justify-center space-x-8">
            <button
              onClick={handleSwipeLeft}
              className="w-16 h-16 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-full flex items-center justify-center transition-colors"
              data-testid="button-swipe-left"
            >
              <X className="w-8 h-8" />
            </button>
            <button
              onClick={handleSwipeRight}
              className="w-16 h-16 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-full flex items-center justify-center transition-colors"
              data-testid="button-swipe-right"
            >
              <Heart className="w-8 h-8" />
            </button>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Or use keyboard: ← for pass, → for like
          </p>
        </div>
      )}
    </div>
  );
}
