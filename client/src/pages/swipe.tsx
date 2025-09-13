import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Heart, X, CheckCircle, ArrowLeft, ThumbsDown } from "lucide-react";
import StockCard from "@/components/stock-card";
import type { StockCard as StockCardType } from "@shared/schema";

export default function Swipe() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [likedStocks, setLikedStocks] = useState<string[]>([]);

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
      
      if (likedStocks.length === 0) {
        throw new Error('At least 1 stock must be selected');
      }
      
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
        description: error.message || "Failed to save your portfolio. Please try again.",
        variant: "destructive"
      });
      console.error('Portfolio save error:', error);
    }
  });


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
      // All cards swiped, validate minimum selection and save portfolio
      setTimeout(() => {
        if (currentLikedStocks.length === 0) {
          toast({
            title: "No Stocks Selected",
            description: "Please select at least 1 stock to create your portfolio.",
            variant: "destructive"
          });
          return;
        }
        savePortfolioMutation.mutate(currentLikedStocks);
      }, 500);
    }
  };

  const totalCards = stockCards.length;

  if (isLoading) {
    return (
      <div className="min-h-screen swipe-gradient flex flex-col justify-center items-center px-6">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <h2 className="text-2xl font-semibold" data-testid="text-loading">Finding your matches...</h2>
          <p className="text-muted-foreground">
            Curating personalized stocks based on your preferences
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
      <div className="min-h-screen swipe-gradient flex flex-col justify-center items-center px-6">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <X className="w-8 h-8 text-destructive" />
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
    <div className="min-h-screen swipe-gradient">
      {/* Simple Header with Back Button */}
      <div className="absolute top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setLocation('/')}
            className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/30 transition-colors"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </div>
        
        {/* Main Title */}
        <div className="text-center mt-8">
          <h1 className="text-white text-3xl font-bold font-din" data-testid="text-swipe-title">
            Swipe the ones you vibe with
          </h1>
        </div>
      </div>
      
      {/* Card Stack Container */}
      <div className="flex-1 flex items-center justify-center px-4 pt-32 pb-6">
        <div className="relative w-full max-w-md h-[600px]">
          {currentCardIndex >= stockCards.length ? (
            <div className="text-center space-y-6 text-white" data-testid="state-no-cards">
              {/* Clean Success Message */}
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Portfolio Complete!</h3>
                <p className="text-lg text-white/90 font-medium">Ready to review your selections</p>
                <p className="text-white/70">
                  You've reviewed {totalCards} stocks and selected {likedStocks.length} for your portfolio
                </p>
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
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleSwipeLeft}
              className="bg-white border border-gray-400/55 rounded-[20px] px-4 py-2 flex items-center space-x-2 hover:bg-gray-50 transition-colors font-din text-sm font-bold leading-4"
              data-testid="button-swipe-left"
            >
              <ThumbsDown className="w-5 h-5" style={{ color: '#E9BD1B' }} />
              <span className="text-black">PASS</span>
            </button>
            <button
              onClick={handleSwipeRight}
              className="bg-white border border-gray-400/55 rounded-[20px] px-4 py-2 flex items-center space-x-2 hover:bg-gray-50 transition-colors font-din text-sm font-bold leading-4"
              data-testid="button-swipe-right"
            >
              <Heart className="w-5 h-5" style={{ color: '#EE5012' }} />
              <span className="text-black">LIKE IT</span>
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
