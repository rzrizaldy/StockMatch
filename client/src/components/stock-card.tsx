import { useState, useRef, useEffect } from "react";
import type { StockCard as StockCardType } from "@shared/schema";
import StockChart from "./stock-chart";

interface StockCardProps {
  stock: StockCardType;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  style?: React.CSSProperties;
}

export default function StockCard({ stock, onSwipeLeft, onSwipeRight, style }: StockCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);
  const [dragDistance, setDragDistance] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0 });

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    startPosRef.current = { x: clientX, y: clientY };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || !cardRef.current) return;

    const deltaX = clientX - startPosRef.current.x;
    const deltaY = clientY - startPosRef.current.y;
    
    setDragDistance(Math.abs(deltaX));
    
    if (Math.abs(deltaX) > 10) {
      setDragDirection(deltaX > 0 ? 'right' : 'left');
    } else {
      setDragDirection(null);
    }

    const rotation = (deltaX / 10) * 5; // Subtle rotation effect
    cardRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotation}deg)`;
  };

  const handleEnd = () => {
    if (!isDragging || !cardRef.current) return;

    setIsDragging(false);
    
    const threshold = 100;
    
    if (dragDistance > threshold) {
      if (dragDirection === 'right') {
        // Animate card off screen to the right
        cardRef.current.style.transform = 'translateX(100vw) rotate(15deg)';
        cardRef.current.style.opacity = '0';
        setTimeout(onSwipeRight, 200);
      } else if (dragDirection === 'left') {
        // Animate card off screen to the left
        cardRef.current.style.transform = 'translateX(-100vw) rotate(-15deg)';
        cardRef.current.style.opacity = '0';
        setTimeout(onSwipeLeft, 200);
      } else {
        // Snap back to center
        cardRef.current.style.transform = 'translate(0, 0) rotate(0deg)';
      }
    } else {
      // Snap back to center
      cardRef.current.style.transform = 'translate(0, 0) rotate(0deg)';
    }
    
    setDragDirection(null);
    setDragDistance(0);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging]);

  // Get risk indicator based on industry and price change
  const getRiskIndicator = (industry: string, priceChange?: string) => {
    // Default fallback for missing or invalid price change data
    const defaultRisk = { color: 'bg-yellow-500', label: 'Med Risk', description: 'Moderate volatility' };
    
    if (!priceChange || typeof priceChange !== 'string' || priceChange.trim() === '') {
      return defaultRisk;
    }
    
    try {
      const cleanedChange = priceChange.replace(/[+%\s]/g, '');
      const changeValue = parseFloat(cleanedChange);
      
      if (isNaN(changeValue)) {
        return defaultRisk;
      }
      
      const isPositive = priceChange.includes('+');
      
      // Simple risk categorization
      if (industry.toLowerCase().includes('tech') || Math.abs(changeValue) > 5) {
        return { color: 'bg-red-500', label: 'High Risk', description: 'Higher volatility' };
      } else if (industry.toLowerCase().includes('healthcare') || industry.toLowerCase().includes('utility')) {
        return { color: 'bg-green-500', label: 'Low Risk', description: 'More stable' };
      } else {
        return { color: 'bg-yellow-500', label: 'Med Risk', description: 'Moderate volatility' };
      }
    } catch (error) {
      console.warn('Error parsing price change:', priceChange, error);
      return defaultRisk;
    }
  };

  // Get price change styling
  const getPriceChangeStyle = (priceChange?: string) => {
    if (!priceChange || typeof priceChange !== 'string') return 'text-muted-foreground';
    const isPositive = priceChange.startsWith('+');
    return isPositive 
      ? 'text-green-600 dark:text-green-400' 
      : 'text-red-600 dark:text-red-400';
  };

  const riskInfo = getRiskIndicator(stock.industry, stock.priceChange);
  const priceChangeStyle = getPriceChangeStyle(stock.priceChange);

  return (
    <div
      ref={cardRef}
      className="absolute inset-0 bg-card rounded-xl shadow-lg border border-border p-6 cursor-grab select-none transition-all duration-200"
      style={{
        ...style,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      data-testid={`stock-card-${stock.ticker}`}
    >
      <div className="flex flex-col h-full">
        {/* Header: Ticker and Risk Indicator */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-1" data-testid={`stock-ticker-${stock.ticker}`}>
              {stock.ticker}
            </h2>
            <p className="text-lg text-muted-foreground" data-testid={`stock-name-${stock.ticker}`}>
              {stock.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${riskInfo.color}`} title={riskInfo.description}></div>
            <span className="text-sm text-muted-foreground">{riskInfo.label}</span>
          </div>
        </div>

        {/* Price and Change */}
        <div className="mb-6">
          <div className="text-2xl font-semibold text-foreground mb-1" data-testid={`stock-price-${stock.ticker}`}>
            {stock.price || '$150.25'}
          </div>
          <div className={`text-lg font-medium ${priceChangeStyle}`} data-testid={`stock-change-${stock.ticker}`}>
            {stock.priceChange || '+2.5%'}
          </div>
        </div>

        {/* Price Chart */}
        {stock.chartData && stock.chartData.length > 0 && (
          <StockChart 
            data={stock.chartData.map(price => parseFloat(price))}
            currentPrice={parseFloat(stock.price?.replace('$', '') || '0')}
            priceChange={stock.priceChange}
            ticker={stock.ticker}
          />
        )}

        {/* AI Sentiment Summary */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Why this might interest you:</h4>
            <p className="text-foreground leading-relaxed" data-testid={`stock-sentiment-${stock.ticker}`}>
              {stock.sentimentSummary || stock.hook || "This company represents a solid investment opportunity with growth potential in its industry sector."}
            </p>
          </div>
        </div>

        {/* Company Logo at Bottom */}
        <div className="mt-6 flex justify-center">
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
            {stock.logoUrl ? (
              <img 
                src={stock.logoUrl} 
                alt={`${stock.name} logo`} 
                className="w-8 h-8 rounded object-contain"
                onError={(e) => {
                  // Fallback to ticker if logo fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<span class="text-lg font-bold text-muted-foreground">${stock.ticker.charAt(0)}</span>`;
                  }
                }}
              />
            ) : (
              <span className="text-lg font-bold text-muted-foreground">{stock.ticker.charAt(0)}</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Swipe Action Hints */}
      <div 
        className={`absolute top-4 right-4 transition-opacity ${
          dragDirection === 'right' && dragDistance > 50 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="bg-secondary/20 border-2 border-secondary text-secondary px-3 py-1 rounded-full text-sm font-medium">
          LIKE
        </div>
      </div>
      <div 
        className={`absolute top-4 left-4 transition-opacity ${
          dragDirection === 'left' && dragDistance > 50 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="bg-destructive/20 border-2 border-destructive text-destructive px-3 py-1 rounded-full text-sm font-medium">
          PASS
        </div>
      </div>
    </div>
  );
}
