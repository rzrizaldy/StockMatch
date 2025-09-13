import { useMemo } from 'react';

interface StockChartProps {
  data: number[];
  currentPrice: number;
  priceChange?: string;
  ticker: string;
  sentimentData?: number[]; // Optional pre-computed sentiment data
}

// Simple deterministic PRNG using ticker and index as seed
function seededRandom(ticker: string, index: number): number {
  // Handle undefined/null ticker with multiple safety checks
  const safeTicker = (ticker && typeof ticker === 'string') ? ticker : 'DEFAULT';
  
  let seed = 0;
  for (let i = 0; i < safeTicker.length; i++) {
    seed = (seed * 31 + safeTicker.charCodeAt(i)) & 0x7fffffff;
  }
  seed = (seed + index * 9973) & 0x7fffffff;
  
  // Simple LCG algorithm
  seed = (seed * 1664525 + 1013904223) & 0x7fffffff;
  return seed / 0x7fffffff;
}

// Generate sentiment data that loosely correlates with price movements but has its own variation
function generateSentimentData(priceData: number[], ticker: string): number[] {
  if (!priceData.length) return [];
  if (priceData.length < 2) return [50]; // Return neutral sentiment for single data point
  
  // Calculate price changes to influence sentiment
  const priceChanges = priceData.map((price, index) => {
    if (index === 0) return 0;
    return ((price - priceData[index - 1]) / priceData[index - 1]) * 100;
  });
  
  // Generate sentiment data with some correlation to price but with its own volatility
  const sentimentValues: number[] = [];
  
  for (let index = 0; index < priceData.length; index++) {
    const baseSentiment = 50; // Neutral baseline
    
    // Factor in price change influence (reduced from ×15 to ×4)
    const priceInfluence = priceChanges[index] * 4;
    
    // Add deterministic pseudo-random variation to make sentiment more realistic
    const randomVariation = (seededRandom(ticker, index) - 0.5) * 15; // Reduced from 20 to 15
    
    // Factor in recent trend (look at last 3 points) - reduced from ×10 to ×3
    let trendInfluence = 0;
    if (index >= 2) {
      const recentTrend = ((priceData[index] - priceData[index - 2]) / priceData[index - 2]) * 100;
      trendInfluence = recentTrend * 3;
    }
    
    // Combine all factors
    let sentiment = baseSentiment + priceInfluence + randomVariation + trendInfluence;
    
    // Add momentum - sentiment tends to follow previous sentiment (FIXED BUG)
    if (index > 0 && sentimentValues.length > 0) {
      const previousSentiment = sentimentValues[index - 1]; // Use actual previous value
      sentiment = sentiment * 0.7 + previousSentiment * 0.3;
    }
    
    // Clamp to 0-100 range and store
    const clampedSentiment = Math.max(0, Math.min(100, sentiment));
    sentimentValues.push(clampedSentiment);
  }
  
  return sentimentValues;
}

export default function StockChart({ data, currentPrice, priceChange, ticker, sentimentData: providedSentimentData }: StockChartProps) {
  if (!data || data.length === 0) return null;

  const minPrice = Math.min(...data);
  const maxPrice = Math.max(...data);
  const priceRange = maxPrice - minPrice;
  
  // Generate or use provided sentiment data with memoization for performance
  const sentimentData = useMemo(() => {
    if (providedSentimentData && providedSentimentData.length === data.length) {
      return providedSentimentData;
    }
    return generateSentimentData(data, ticker);
  }, [data, ticker, providedSentimentData]);
  
  // Determine if trend is positive
  const isPositive = data[data.length - 1] > data[0];
  const strokeColor = isPositive ? '#22c55e' : '#ef4444'; // green or red
  
  // Generate SVG path dimensions
  const width = 120;
  const height = 40;
  const padding = 4;
  
  // Generate price line points
  const pricePoints = data.map((price, index) => {
    const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((price - minPrice) / priceRange) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  // Generate sentiment line points (mapped to 0-100 scale)
  const sentimentPoints = sentimentData.map((sentiment, index) => {
    const x = (index / (sentimentData.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - (sentiment / 100) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  // Calculate sentiment trend
  const sentimentTrend = sentimentData[sentimentData.length - 1] - sentimentData[0];
  const avgSentiment = sentimentData.reduce((sum, val) => sum + val, 0) / sentimentData.length;

  return (
    <div className="mb-4" data-testid={`stock-chart-${ticker}`}>
      <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">30-day trend & sentiment</span>
          <div className="flex items-center gap-2 text-xs">
            <span className={`font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isPositive ? '↗' : '↘'} {priceChange || '+0.0%'}
            </span>
            <span className="text-orange-600 dark:text-orange-400 font-medium">
              📊 {Math.round(avgSentiment)}%
            </span>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-3 mb-2 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-0.5 ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>Price</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-0.5 bg-orange-500"></div>
            <span>Sentiment</span>
          </div>
        </div>
        
        <svg 
          width={width} 
          height={height} 
          className="w-full h-8"
          preserveAspectRatio="none"
          viewBox={`0 0 ${width} ${height}`}
        >
          <defs>
            {/* Price gradient */}
            <linearGradient id={`price-gradient-${ticker}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2"/>
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0"/>
            </linearGradient>
            {/* Sentiment gradient */}
            <linearGradient id={`sentiment-gradient-${ticker}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFA500" stopOpacity="0.1"/>
              <stop offset="100%" stopColor="#FFA500" stopOpacity="0"/>
            </linearGradient>
          </defs>
          
          {/* Price line with gradient fill */}
          <polygon
            fill={`url(#price-gradient-${ticker})`}
            points={`${padding},${height} ${pricePoints} ${width-padding},${height}`}
          />
          <polyline
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.5"
            points={pricePoints}
            opacity="0.8"
            data-testid={`price-line-${ticker}`}
          />
          
          {/* Sentiment line with subtle gradient fill */}
          <polygon
            fill={`url(#sentiment-gradient-${ticker})`}
            points={`${padding},${height} ${sentimentPoints} ${width-padding},${height}`}
          />
          <polyline
            fill="none"
            stroke="#FFA500"
            strokeWidth="1"
            points={sentimentPoints}
            opacity="0.7"
            strokeDasharray="2,2"
            data-testid={`sentiment-line-${ticker}`}
          />
        </svg>
      </div>
    </div>
  );
}