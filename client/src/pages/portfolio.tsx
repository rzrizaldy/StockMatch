import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CheckCircle, RefreshCw, ExternalLink, FileSpreadsheet, Share2, Info } from "lucide-react";
import PortfolioChart from "@/components/portfolio-chart";
import type { StockCard } from "@shared/schema";

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
      <div className="min-h-screen flex flex-col justify-center items-center px-6 bg-background">
        <div className="text-center space-y-6 fade-in">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto animate-pulse">
            <CheckCircle className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-semibold" data-testid="text-loading-portfolio">Creating your portfolio...</h2>
        </div>
      </div>
    );
  }

  if (error || !portfolioData) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-6 bg-background">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-semibold text-destructive" data-testid="text-error-portfolio">
            Failed to load portfolio
          </h2>
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
  const allocationPercentage = stockCount > 0 ? Math.round(100 / stockCount) : 0;
  const allocationValue = stockCount > 0 ? Math.round(parseInt(portfolio.totalValue) / stockCount) : 0;

  const chartData = stocks.map((stock, index) => ({
    name: stock.name,
    ticker: stock.ticker,
    value: allocationPercentage,
    color: `hsl(${(index * 360) / stockCount}, 70%, 50%)`
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold" data-testid="text-portfolio-title">Your StockMatch Portfolio</h1>
            <button
              onClick={handleReset}
              className="text-muted-foreground hover:text-foreground"
              data-testid="button-reset-header"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-8">
        {/* Success Message */}
        <div className="text-center space-y-4 fade-in" data-testid="section-success">
          <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-secondary" />
          </div>
          <h2 className="text-2xl font-bold">Portfolio Created! 🎉</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Based on your preferences, we've created an equally-weighted portfolio of{' '}
            <span className="font-semibold" data-testid="text-stock-count">{stockCount}</span> companies you loved.
          </p>
        </div>
        
        {/* Portfolio Visualization */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4" data-testid="text-allocation-title">Portfolio Allocation</h3>
            
            {/* Chart Container */}
            <div className="relative h-64 mb-6">
              <PortfolioChart data={chartData} />
            </div>
            
            {/* Portfolio Summary Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary" data-testid="text-portfolio-value">
                  ${parseInt(portfolio.totalValue).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Portfolio Value</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-secondary" data-testid="text-company-count">
                  {stockCount}
                </div>
                <div className="text-sm text-muted-foreground">Companies</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Liked Stocks List */}
        <div className="bg-card rounded-xl shadow-sm border border-border">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4" data-testid="text-selected-companies">Your Selected Companies</h3>
            
            <div className="space-y-3" data-testid="list-liked-stocks">
              {stocks.map((stock, index) => (
                <div
                  key={stock.ticker}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                  data-testid={`stock-item-${stock.ticker}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      {stock.logoUrl ? (
                        <img src={stock.logoUrl} alt={stock.name} className="w-8 h-8 rounded" />
                      ) : (
                        <span className="text-lg font-bold text-primary">
                          {stock.ticker.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium" data-testid={`stock-name-${stock.ticker}`}>
                        {stock.name}
                      </div>
                      <div className="text-sm text-muted-foreground" data-testid={`stock-ticker-${stock.ticker}`}>
                        {stock.ticker}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold" data-testid={`stock-allocation-${stock.ticker}`}>
                      {allocationPercentage}%
                    </div>
                    <div className="text-sm text-muted-foreground" data-testid={`stock-value-${stock.ticker}`}>
                      ${allocationValue.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Primary CTA */}
          <button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 px-6 rounded-lg font-semibold text-lg shadow-lg transition-colors"
            data-testid="button-connect-brokerage"
          >
            <ExternalLink className="w-5 h-5 mr-2 inline" />
            Connect Brokerage to Invest
          </button>
          
          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleExportToSheets}
              className="flex items-center justify-center space-x-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground py-3 px-4 rounded-lg font-medium transition-colors"
              data-testid="button-export-sheets"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export to Sheets</span>
            </button>
            
            <button
              onClick={handleSharePortfolio}
              className="flex items-center justify-center space-x-2 bg-accent hover:bg-accent/90 text-accent-foreground py-3 px-4 rounded-lg font-medium transition-colors"
              data-testid="button-share-portfolio"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Portfolio</span>
            </button>
          </div>
          
          {/* Start Over */}
          <button
            onClick={handleReset}
            className="w-full bg-muted hover:bg-muted/80 text-muted-foreground py-3 px-4 rounded-lg font-medium transition-colors"
            data-testid="button-start-over"
          >
            <RefreshCw className="w-4 h-4 mr-2 inline" />
            Start Over with New Preferences
          </button>
        </div>
        
        {/* Disclaimer */}
        <div className="bg-muted/50 rounded-lg p-4 text-center" data-testid="disclaimer">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <Info className="w-3 h-3 inline mr-1" />
            This is for educational purposes only and not financial advice. 
            Please consult with a financial advisor before making investment decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
