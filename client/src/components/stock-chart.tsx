interface StockChartProps {
  data: number[];
  currentPrice: number;
  priceChange?: string;
  ticker: string;
}

export default function StockChart({ data, currentPrice, priceChange, ticker }: StockChartProps) {
  if (!data || data.length === 0) return null;

  const minPrice = Math.min(...data);
  const maxPrice = Math.max(...data);
  const priceRange = maxPrice - minPrice;
  
  // Determine if trend is positive
  const isPositive = data[data.length - 1] > data[0];
  const strokeColor = isPositive ? '#22c55e' : '#ef4444'; // green or red
  
  // Generate SVG path
  const width = 120;
  const height = 40;
  const padding = 4;
  
  const points = data.map((price, index) => {
    const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((price - minPrice) / priceRange) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="mb-4" data-testid={`stock-chart-${ticker}`}>
      <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">30-day trend</span>
          <span className={`text-xs font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {isPositive ? '↗' : '↘'} {priceChange || '+0.0%'}
          </span>
        </div>
        <svg 
          width={width} 
          height={height} 
          className="w-full h-8"
          preserveAspectRatio="none"
          viewBox={`0 0 ${width} ${height}`}
        >
          <polyline
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.5"
            points={points}
            opacity="0.8"
          />
          {/* Add subtle gradient fill */}
          <defs>
            <linearGradient id={`gradient-${ticker}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2"/>
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0"/>
            </linearGradient>
          </defs>
          <polygon
            fill={`url(#gradient-${ticker})`}
            points={`${padding},${height} ${points} ${width-padding},${height}`}
          />
        </svg>
      </div>
    </div>
  );
}