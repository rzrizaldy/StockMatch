import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Settings, Heart, X, CheckCircle } from "lucide-react";
import StockCard from "@/components/stock-card";
import type { StockCard as StockCardType } from "@shared/schema";

export default function Swipe() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [likedStocks, setLikedStocks] = useState<string[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);

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
    
    if (nextIndex >= stockCards.length) {
      // All cards swiped, save portfolio with the most up-to-date liked stocks
      setTimeout(() => {
        savePortfolioMutation.mutate(currentLikedStocks);
      }, 500);
    }
  };

  const progress = stockCards.length > 0 ? (currentCardIndex / stockCards.length) * 100 : 0;
  const remainingCards = Math.max(0, stockCards.length - currentCardIndex);

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
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-semibold" data-testid="text-app-title">StockMatch</h1>
              <div className="text-sm text-muted-foreground" data-testid="text-cards-remaining">
                {remainingCards} cards left
              </div>
            </div>
            <button className="text-muted-foreground hover:text-foreground" data-testid="button-settings">
              <Settings className="w-5 h-5" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-1 mt-3">
            <div 
              className="bg-primary h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
              data-testid="progress-swipe"
            />
          </div>
        </div>
      </div>
      
      {/* Swipe Instructions */}
      {showInstructions && (
        <div className="px-6 py-4 text-center border-b border-border bg-muted/30" data-testid="instructions-swipe">
          <p className="text-sm text-muted-foreground">
            <Heart className="w-4 h-4 inline text-secondary mr-1" />
            Swipe right on companies you'd like to invest in
            <X className="w-4 h-4 inline text-destructive ml-3 mr-1" />
            Swipe left to pass
          </p>
        </div>
      )}
      
      {/* Card Stack Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="relative w-full max-w-md h-[600px]">
          {currentCardIndex >= stockCards.length ? (
            <div className="text-center space-y-4" data-testid="state-no-cards">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold">All done!</h3>
              <p className="text-muted-foreground">Ready to see your portfolio?</p>
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
