interface CompactSparklineProps {
  data: number[];
  ticker: string;
  isPositive?: boolean;
}

export default function CompactSparkline({ data, ticker, isPositive = true }: CompactSparklineProps) {
  if (!data || data.length === 0) return null;

  const minPrice = Math.min(...data);
  const maxPrice = Math.max(...data);
  const priceRange = maxPrice - minPrice;
  
  // Handle flat line case
  if (priceRange === 0) {
    return (
      <div className="w-16 h-8 flex items-center justify-center">
        <div className="w-full h-0.5 bg-muted-foreground/30 rounded"></div>
      </div>
    );
  }
  
  const strokeColor = isPositive ? '#10b981' : '#ef4444'; // emerald-500 or red-500
  
  // Generate SVG path - compact version
  const width = 64; // 16 * 4 = w-16
  const height = 32; // 8 * 4 = h-8
  const padding = 2;
  
  const points = data.map((price, index) => {
    const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((price - minPrice) / priceRange) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-16 h-8" data-testid={`sparkline-${ticker}`}>
      <svg 
        width={width} 
        height={height} 
        className="w-full h-full"
        viewBox={`0 0 ${width} ${height}`}
      >
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1"
          points={points}
          opacity="0.9"
        />
        {/* Subtle gradient fill */}
        <defs>
          <linearGradient id={`mini-gradient-${ticker}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.15"/>
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polygon
          fill={`url(#mini-gradient-${ticker})`}
          points={`${padding},${height} ${points} ${width-padding},${height}`}
        />
      </svg>
    </div>
  );
}