import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { RefreshCw, AlertTriangle, FileSpreadsheet, Share2, TrendingUp, Brain } from "lucide-react";
import mascotImage from "@assets/image_1757788388059.png";
import type { StockCard } from "@shared/schema";
import SentimentCharts from "@/components/sentiment-charts";
import AISentimentAnalysis from "@/components/ai-sentiment-analysis";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Component for stock logo with error handling
interface StockLogoProps {
  stock: StockCard;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function StockLogo({ stock, size = 'md', className = '' }: StockLogoProps) {
  const [logoError, setLogoError] = useState(false);
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };
  
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl'
  };
  
  return (
    <div className={`${sizeClasses[size]} bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 ${className}`}>
      {stock.logoUrl && !logoError ? (
        <img 
          src={stock.logoUrl} 
          alt={`${stock.name} logo`} 
          className={`${sizeClasses[size]} rounded object-contain`}
          onError={() => setLogoError(true)}
        />
      ) : (
        <span className={`${textSizeClasses[size]} font-bold text-primary`}>
          {stock.ticker.charAt(0)}
        </span>
      )}
    </div>
  );
}

export default function Portfolio() {
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const storedSessionId = sessionStorage.getItem('stockmatch_session');
    if (!storedSessionId) {
      setLocation('/');
      return;
    }
    setSessionId(storedSessionId);
  }, [setLocation]);

  const { data: portfolioData, isLoading, error } = useQuery({
    queryKey: ['/api/portfolio', sessionId],
    queryFn: () => api.getPortfolio(sessionId!),
    enabled: !!sessionId,
  });

  const { data: userProfile } = useQuery({
    queryKey: ['/api/user-profile', sessionId],
    queryFn: () => api.getUserProfile(sessionId!),
    enabled: !!sessionId,
  });

  // Fetch AI sentiment analysis for portfolio stocks
  const { data: sentimentAnalysisData, isLoading: sentimentLoading } = useQuery({
    queryKey: ['/api/sentiment-analysis', portfolioData?.portfolio.likedStocks],
    queryFn: () => api.getSentimentAnalysis(portfolioData?.portfolio.likedStocks || []),
    enabled: !!portfolioData?.portfolio.likedStocks && portfolioData.portfolio.likedStocks.length > 0,
  });

  const handleExportToSheets = () => {
    alert('Export to Sheets functionality would integrate with Google Sheets API');
  };

  const handleSharePortfolio = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My StockMatch Portfolio',
          text: 'Check out my personalized investment portfolio created with StockMatch!',
          url: window.location.href
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Fallback for browsers without Web Share API
      await navigator.clipboard.writeText(window.location.href);
      alert('Portfolio link copied to clipboard!');
    }
  };

  const handleReset = () => {
    sessionStorage.removeItem('stockmatch_session');
    setLocation('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-6 relative bg-white overflow-hidden">
        {/* Portfolio Background */}
        <div className="absolute inset-0 w-full h-full" style={{background: 'linear-gradient(59deg, #57C30A 0%, white 86%)'}}>
          {/* Large decorative circle */}
          <div className="absolute w-[584px] h-[394px] -left-32 -top-32 bg-[#B6D8B6] rounded-full"></div>
          
          {/* Scattered celebration shapes */}
          <div className="absolute w-6 h-5 left-80 top-20 bg-[#57C30A]"></div>
          <div className="absolute w-8 h-5 left-72 top-60 bg-[#57C30A]"></div>
          <div className="absolute w-4 h-6 left-[450px] top-20 bg-[#57C30A]"></div>
          <div className="absolute w-4 h-6 left-44 top-72 bg-[#57C30A]"></div>
          <div className="absolute w-4 h-6 left-[480px] top-68 bg-[#57C30A]"></div>
          <div className="absolute w-4 h-7 left-[470px] top-42 bg-[#57C30A]"></div>
          <div className="absolute w-5 h-9 left-[440px] top-60 bg-[#57C30A]"></div>
          <div className="absolute w-2 h-3 left-[400px] top-20 bg-[#B1D671]"></div>
          <div className="absolute w-2 h-3 left-72 top-68 bg-[#B1D671]"></div>
          <div className="absolute w-3 h-2 left-[490px] top-28 bg-[#B1D671]"></div>
          <div className="absolute w-3 h-2 left-[450px] top-80 bg-[#B1D671]"></div>
          <div className="absolute w-3 h-2 left-80 top-76 bg-[#57C30A]"></div>
          <div className="absolute w-2 h-2 left-[440px] top-36 bg-[#57C30A]"></div>
          <div className="absolute w-2 h-2 left-88 top-24 bg-[#57C30A]"></div>
          <div className="absolute w-2 h-2 left-[420px] top-72 bg-[#57C30A]"></div>
          <div className="absolute w-2 h-2 left-80 top-48 bg-[#57C30A]"></div>
          <div className="absolute w-2 h-2 left-[500px] top-60 bg-[#57C30A]"></div>
          <div className="absolute w-3 h-2 left-[400px] top-36 bg-[#B1D671]"></div>
          <div className="absolute w-2 h-3 left-[510px] top-84 bg-[#57C30A]"></div>
          <div className="absolute w-3 h-3 left-[400px] top-40 bg-[#023341]"></div>
          <div className="absolute w-3 h-7 left-52 top-24 bg-[#57C30A]"></div>
        </div>
        
        <div className="text-center space-y-6 relative z-10">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <h2 className="text-2xl font-semibold" data-testid="text-loading-portfolio">Creating your portfolio...</h2>
          <p className="text-muted-foreground">Analyzing your preferences and building your personalized investment portfolio</p>
        </div>
      </div>
    );
  }

  if (error || !portfolioData) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-6 relative bg-white overflow-hidden">
        {/* Portfolio Background */}
        <div className="absolute inset-0 w-full h-full" style={{background: 'linear-gradient(59deg, #57C30A 0%, white 86%)'}}>
          <div className="absolute w-[584px] h-[394px] -left-32 -top-32 bg-[#B6D8B6] rounded-full"></div>
        </div>
        
        <div className="text-center space-y-6 relative z-10">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-semibold text-destructive" data-testid="text-error-portfolio">
            Failed to load portfolio
          </h2>
          <p className="text-muted-foreground">Please try again or start over to create a new portfolio</p>
          <button
            onClick={() => setLocation('/')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium"
            data-testid="button-start-over"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const { portfolio, stocks } = portfolioData;
  const stockCount = stocks.length;

  return (
    <div className="w-full h-screen bg-[#8BC34A] overflow-hidden relative">
      
      {/* Top Reset Button */}
      <button
        onClick={handleReset}
        className="absolute top-6 right-6 z-50 text-white/80 hover:text-white bg-white/10 rounded-lg p-2 backdrop-blur-sm transition-colors"
        data-testid="button-reset"
      >
        <RefreshCw className="w-5 h-5" />
      </button>
      
      {/* Scrollable Content */}
      <div className="w-full h-full overflow-y-auto">
        {/* Top Section with Header and Mascot */}
        <div className="relative min-h-[300px] px-6 pt-20 pb-8">
          {/* Mascot Image */}
          <img 
            src={mascotImage} 
            alt="Portfolio Mascot"
            className="absolute"
            style={{ 
              width: '81px', 
              height: '97px', 
              left: '50%', 
              top: '80px',
              transform: 'translateX(-50%)'
            }}
          />
          
          {/* Header Text */}
          <div className="text-center mt-32">
            <h1 
              className="text-white font-bold mb-2"
              style={{ fontSize: '30px', fontFamily: 'DIN Alternate, sans-serif', lineHeight: '32px' }}
              data-testid="text-portfolio-title"
            >
              Portfolio Created
            </h1>
            <p 
              className="text-white font-bold px-4"
              style={{ fontSize: '15px', fontFamily: 'DIN Alternate, sans-serif', lineHeight: '20px' }}
              data-testid="text-portfolio-subtitle"
            >
              We've created an equally-weighted portfolio of {stockCount} companies you loved
            </p>
          </div>
        </div>
        
        {/* White Content Section */}
        <div 
          className="bg-white min-h-screen"
          style={{ 
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px'
          }}
        >
        <div className="p-6 space-y-6">
          {/* Portfolio Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <div className="text-2xl font-bold text-primary" data-testid="text-portfolio-value">
                ${parseInt(portfolio.totalValue).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Portfolio Value</div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4 text-center">
              <div className="text-2xl font-bold text-primary" data-testid="text-company-count">
                {stockCount}
              </div>
              <div className="text-sm text-muted-foreground">Companies</div>
            </div>
          </div>
          
          {/* Selected Companies List */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-lg mb-4" data-testid="text-selected-companies">Your Selected Companies</h3>
            <div className="space-y-3" data-testid="list-selected-companies">
              {stocks.map((stock) => (
                <div key={stock.ticker} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg" data-testid={`company-${stock.ticker}`}>
                  <div className="flex items-center space-x-3">
                    <StockLogo stock={stock} size="lg" />
                    <div>
                      <div className="font-medium" data-testid={`company-name-${stock.ticker}`}>
                        {stock.name}
                      </div>
                      <div className="text-sm text-muted-foreground" data-testid={`company-ticker-${stock.ticker}`}>
                        {stock.ticker}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold" data-testid={`company-allocation-${stock.ticker}`}>
                      {Math.round(100 / stockCount)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sentiment Analysis Section */}
          <div className="bg-card rounded-xl border border-border p-6" data-testid="sentiment-analysis-section">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg" data-testid="text-sentiment-analysis-title">
                Sentiment Analysis
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6" data-testid="text-sentiment-analysis-description">
              Comprehensive sentiment analysis combining AI insights and market data for your portfolio stocks.
            </p>
            
            <Accordion type="single" collapsible className="w-full" data-testid="sentiment-accordion">
              {stocks.map((stock) => {
                const aiAnalysis = sentimentAnalysisData?.analyses.find(analysis => analysis.ticker === stock.ticker);
                
                return (
                  <AccordionItem key={stock.ticker} value={stock.ticker} data-testid={`sentiment-accordion-item-${stock.ticker}`}>
                    <AccordionTrigger className="text-left hover:no-underline" data-testid={`sentiment-trigger-${stock.ticker}`}>
                      <div className="flex items-center gap-3">
                        <StockLogo stock={stock} size="md" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{stock.name}</div>
                          <div className="text-xs text-muted-foreground">{stock.ticker}</div>
                        </div>
                        {aiAnalysis && (
                          <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-blue-500" />
                            <span className={`text-xs px-2 py-1 rounded ${
                              aiAnalysis.overallScore > 0.1 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : aiAnalysis.overallScore < -0.1 
                                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
                            }`}>
                              {aiAnalysis.overallScore > 0 ? '+' : ''}{(aiAnalysis.overallScore * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                        {sentimentLoading && (
                          <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent data-testid={`sentiment-content-${stock.ticker}`}>
                      <div className="pt-4">
                        <Tabs defaultValue="ai-analysis" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="ai-analysis" className="flex items-center gap-2">
                              <Brain className="w-4 h-4" />
                              AI Insights
                            </TabsTrigger>
                            <TabsTrigger value="market-data" className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              Market Data
                            </TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="ai-analysis" className="mt-4">
                            {sentimentLoading ? (
                              <div className="flex items-center justify-center py-8" data-testid={`ai-loading-${stock.ticker}`}>
                                <div className="text-center space-y-2">
                                  <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
                                  <p className="text-sm text-muted-foreground">Generating AI analysis...</p>
                                </div>
                              </div>
                            ) : aiAnalysis ? (
                              <AISentimentAnalysis 
                                analysis={aiAnalysis}
                                className="w-full"
                              />
                            ) : (
                              <div className="text-center py-8" data-testid={`ai-error-${stock.ticker}`}>
                                <p className="text-sm text-muted-foreground">AI analysis unavailable for this stock</p>
                              </div>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="market-data" className="mt-4">
                            <SentimentCharts 
                              stock={stock.ticker} 
                              className="w-full"
                            />
                          </TabsContent>
                        </Tabs>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleSharePortfolio}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              data-testid="button-start-trading"
            >
              <TrendingUp className="w-5 h-5" />
              Start Trading
            </button>
            <button
              onClick={handleExportToSheets}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              data-testid="button-share"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>
          
          {/* Start Over */}
          <div className="text-center pt-4">
            <button
              onClick={handleReset}
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              data-testid="button-start-over"
            >
              Start Over
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}