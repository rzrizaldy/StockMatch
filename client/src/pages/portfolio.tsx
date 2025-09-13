import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CheckCircle, RefreshCw, ExternalLink, FileSpreadsheet, Share2, Info, TrendingUp, TrendingDown, AlertTriangle, Target, Heart } from "lucide-react";
import PortfolioChart from "@/components/portfolio-chart";
import CompactSparkline from "@/components/compact-sparkline";
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
    industry: stock.industry,
    color: `hsl(${(index * 360) / stockCount}, 70%, 50%)`
  }));

  // Mock historical performance data
  const mockPerformance = {
    portfolioReturn: 12.3,
    sp500Return: 10.8,
    nasdaqReturn: 11.4,
    bestYear: { year: 2021, return: 28.4 },
    worstYear: { year: 2022, return: -15.2 },
    volatility: 1.6,
    revenueGrowth: 22
  };

  // Mock expectation data based on $10,000 investment
  const baseInvestment = 10000;
  const expectations = {
    oneYear: { low: 10500, high: 11200 },
    fiveYear: { low: 14000, high: 18500 },
    tenYear: { low: 23000, high: 35000 }
  };

  // Generate mock 7-day performance data for sparklines
  const generateMockSparklineData = (ticker: string): { data: number[], dailyChange: number, isPositive: boolean } => {
    const basePrice = Math.random() * 200 + 50; // Random base price between $50-$250
    const volatility = ticker === 'NVDA' ? 0.08 : ticker === 'TSLA' ? 0.1 : 0.04; // Higher volatility for certain stocks
    
    const data: number[] = [basePrice];
    for (let i = 1; i < 7; i++) {
      const change = (Math.random() - 0.5) * 2 * volatility * basePrice;
      data.push(Math.max(data[i - 1] + change, basePrice * 0.5)); // Prevent unrealistic drops
    }
    
    const dailyChange = ((data[6] - data[5]) / data[5]) * 100;
    const isPositive = dailyChange >= 0;
    
    return { data, dailyChange, isPositive };
  };

  // Generate performance data for each stock
  const stockPerformanceData = stocks.reduce((acc, stock) => {
    acc[stock.ticker] = generateMockSparklineData(stock.ticker);
    return acc;
  }, {} as Record<string, { data: number[], dailyChange: number, isPositive: boolean }>);

  // Generate AI summary based on portfolio composition
  const generateAISummary = () => {
    const riskLevel = 'moderate'; // Default risk level
    const timeline = '5+ years'; // Default timeline
    const hasNVIDIA = stocks.some(stock => stock.ticker === 'NVDA');
    const hasTech = stocks.some(stock => 
      ['NVDA', 'GOOGL', 'MSFT', 'AAPL', 'AMZN', 'META', 'TSLA'].includes(stock.ticker)
    );
    
    if (stockCount === 1 && hasNVIDIA) {
      return {
        summary: `Based on your ${riskLevel} risk profile and ${timeline} timeline, this portfolio maximizes conviction in AI leadership. NVIDIA's dominant position in the semiconductor revolution aligns perfectly with your tech preference and concentrated investment approach.`,
        insights: [
          'Exceptional growth potential in AI/semiconductor sector',
          `Moderate to high volatility (β: ${mockPerformance.volatility})`,
          `Strong fundamentals (Revenue growth: ${mockPerformance.revenueGrowth}% annually)`
        ]
      };
    }
    
    if (hasTech && stockCount <= 3) {
      return {
        summary: `Based on your ${riskLevel} risk profile and ${timeline} timeline, this focused portfolio balances growth potential with quality. Your tech-heavy selection shows conviction in innovation while maintaining diversification across market leaders.`,
        insights: [
          'High growth potential in technology sector',
          `Balanced volatility for concentrated portfolio`,
          'Exposure to multiple innovation themes'
        ]
      };
    }
    
    return {
      summary: `Based on your ${riskLevel} risk profile and ${timeline} timeline, this diversified portfolio balances growth potential with stability. Your selections show a balanced approach to building long-term wealth across multiple sectors.`,
      insights: [
        'Diversified exposure across sectors',
        'Balanced risk-return profile',
        'Suitable for long-term wealth building'
      ]
    };
  };

  const aiSummary = generateAISummary();

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
        
        {/* Historical Performance Section */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center" data-testid="text-performance-title">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              📈 Historical Performance
            </h3>
            
            <div className="space-y-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Your portfolio would have returned</p>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400" data-testid="text-portfolio-return">
                  {mockPerformance.portfolioReturn}%
                </div>
                <p className="text-sm text-muted-foreground">annually over the past 5 years</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">vs S&P 500</div>
                  <div className="text-xl font-semibold" data-testid="text-sp500-comparison">
                    {mockPerformance.sp500Return}%
                  </div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-sm text-muted-foreground">vs NASDAQ</div>
                  <div className="text-xl font-semibold" data-testid="text-nasdaq-comparison">
                    {mockPerformance.nasdaqReturn}%
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">Best Year</div>
                  <div className="font-semibold text-green-600 dark:text-green-400" data-testid="text-best-year">
                    +{mockPerformance.bestYear.return}% ({mockPerformance.bestYear.year})
                  </div>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">Worst Year</div>
                  <div className="font-semibold text-red-600 dark:text-red-400" data-testid="text-worst-year">
                    {mockPerformance.worstYear.return}% ({mockPerformance.worstYear.year})
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Investment Summary */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center" data-testid="text-ai-summary-title">
              🤖 Your Investment Summary
            </h3>
            
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed" data-testid="text-ai-summary">
                {aiSummary.summary}
              </p>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Key Insights:</h4>
                <ul className="space-y-1">
                  {aiSummary.insights.map((insight, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start" data-testid={`insight-${index}`}>
                      <span className="text-primary mr-2">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Expectation Setting */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center" data-testid="text-expectations-title">
              <Target className="w-5 h-5 mr-2 text-blue-500" />
              💡 What to Expect
            </h3>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                If you invest ${baseInvestment.toLocaleString()} today, based on historical patterns:
              </p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">1 Year</div>
                    <div className="text-xs text-muted-foreground">Conservative estimate</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold" data-testid="text-1year-projection">
                      ${expectations.oneYear.low.toLocaleString()} - ${expectations.oneYear.high.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">5 Years</div>
                    <div className="text-xs text-muted-foreground">Compound growth</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold" data-testid="text-5year-projection">
                      ${expectations.fiveYear.low.toLocaleString()} - ${expectations.fiveYear.high.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">10 Years</div>
                    <div className="text-xs text-muted-foreground">Long-term potential</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold" data-testid="text-10year-projection">
                      ${expectations.tenYear.low.toLocaleString()} - ${expectations.tenYear.high.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  Past performance doesn't guarantee future results
                </p>
              </div>
            </div>
          </div>
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
              {stocks.map((stock, index) => {
                const performanceData = stockPerformanceData[stock.ticker];
                return (
                  <div
                    key={stock.ticker}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/40 transition-colors"
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
                    
                    {/* Middle section - Sparkline */}
                    <div className="hidden sm:flex flex-col items-center space-y-1">
                      <CompactSparkline 
                        data={performanceData.data} 
                        ticker={stock.ticker}
                        isPositive={performanceData.isPositive}
                      />
                      <span className="text-xs text-muted-foreground">7-day</span>
                    </div>
                    
                    {/* Right section - Performance & Allocation */}
                    <div className="text-right space-y-1">
                      <div className="flex items-center justify-end space-x-2">
                        <span className="font-semibold" data-testid={`stock-allocation-${stock.ticker}`}>
                          {allocationPercentage}%
                        </span>
                        <div className={`flex items-center ${performanceData.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                          {performanceData.isPositive ? (
                            <TrendingUp className="w-4 h-4" data-testid={`trend-up-${stock.ticker}`} />
                          ) : (
                            <TrendingDown className="w-4 h-4" data-testid={`trend-down-${stock.ticker}`} />
                          )}
                          <span className="text-xs ml-1" data-testid={`daily-change-${stock.ticker}`}>
                            {performanceData.dailyChange > 0 ? '+' : ''}{performanceData.dailyChange.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground" data-testid={`stock-value-${stock.ticker}`}>
                        ${allocationValue.toLocaleString()}
                      </div>
                      {/* Mobile sparkline - shown on smaller screens */}
                      <div className="sm:hidden mt-2">
                        <CompactSparkline 
                          data={performanceData.data} 
                          ticker={stock.ticker}
                          isPositive={performanceData.isPositive}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Personal Touch Closing */}
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-border p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold flex items-center justify-center" data-testid="text-ready-invest">
              🎉 Ready to Invest?
            </h3>
            
            <div className="max-w-md mx-auto">
              <p className="text-muted-foreground mb-2" data-testid="text-personal-message">
                {stockCount === 1 && stocks[0]?.ticker === 'NVDA' 
                  ? "You've chosen quality over quantity with NVIDIA - a company at the forefront of AI revolution. We hope you love this concentrated bet on the future of technology!"
                  : stockCount <= 3 
                  ? `You've carefully selected ${stockCount} exceptional ${stockCount === 1 ? 'company' : 'companies'} that align with your investment vision. Quality over quantity - a strategy used by legendary investors!`
                  : `Your diversified selection of ${stockCount} companies shows excellent judgment in building a balanced portfolio. You've chosen established leaders across multiple sectors.`
                }
              </p>
              
              {/* Confidence Score */}
              <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium mb-4" data-testid="confidence-score">
                <Heart className="w-4 h-4" />
                92% confidence in your choices
              </div>
            </div>
            
            {/* Enhanced Action Buttons */}
            <div className="space-y-3">
              <button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 px-6 rounded-lg font-semibold text-lg shadow-lg transition-colors"
                data-testid="button-start-investing"
              >
                <ExternalLink className="w-5 h-5 mr-2 inline" />
                Start Investing
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center space-x-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground py-3 px-4 rounded-lg font-medium transition-colors"
                  data-testid="button-modify-portfolio"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Modify Portfolio</span>
                </button>
                
                <button
                  onClick={handleSharePortfolio}
                  className="flex items-center justify-center space-x-2 bg-accent hover:bg-accent/90 text-accent-foreground py-3 px-4 rounded-lg font-medium transition-colors"
                  data-testid="button-share-results"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Results</span>
                </button>
              </div>
            </div>
            
            {/* StockMatch Branding */}
            <div className="pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1" data-testid="text-branding">
                Built with <Heart className="w-3 h-3 text-red-500" /> by StockMatch
              </p>
            </div>
          </div>
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
