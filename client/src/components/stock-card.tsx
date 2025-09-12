import { useState, useRef, useEffect } from "react";
import type { StockCard as StockCardType } from "@shared/schema";

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

  // Get industry colors/categories
  const getIndustryInfo = (industry: string) => {
    const industryMap: Record<string, { color: string; category: string }> = {
      'Technology': { color: 'bg-primary/10 text-primary', category: 'Technology' },
      'Software': { color: 'bg-primary/10 text-primary', category: 'Technology' },
      'Healthcare': { color: 'bg-secondary/10 text-secondary', category: 'Healthcare' },
      'Finance': { color: 'bg-accent/10 text-accent', category: 'Finance' },
      'Consumer': { color: 'bg-chart-4/10 text-chart-4', category: 'Consumer' },
      'Energy': { color: 'bg-secondary/10 text-secondary', category: 'Energy' },
      'Entertainment': { color: 'bg-chart-5/10 text-chart-5', category: 'Media' }
    };
    
    for (const [key, value] of Object.entries(industryMap)) {
      if (industry.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    
    return { color: 'bg-primary/10 text-primary', category: 'Technology' };
  };

  const industryInfo = getIndustryInfo(stock.industry);

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
      <div className="space-y-4">
        {/* Company Logo and Basic Info */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
            {stock.logoUrl ? (
              <img 
                src={stock.logoUrl} 
                alt={`${stock.name} logo`} 
                className="w-12 h-12 rounded-lg object-contain"
                onError={(e) => {
                  // Fallback to ticker if logo fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<span class="text-2xl font-bold text-primary">${stock.ticker.charAt(0)}</span>`;
                  }
                }}
              />
            ) : (
              <span className="text-2xl font-bold text-primary">{stock.ticker.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold" data-testid={`stock-name-${stock.ticker}`}>
              {stock.name}
            </h3>
            <span className="text-muted-foreground font-mono" data-testid={`stock-ticker-${stock.ticker}`}>
              {stock.ticker}
            </span>
          </div>
        </div>
        
        {/* Company Hook */}
        <p className="text-foreground/80 leading-relaxed" data-testid={`stock-hook-${stock.ticker}`}>
          {stock.hook}
        </p>
        
        {/* Key Metric */}
        <div className="bg-muted rounded-lg p-4">
          <div className="text-sm text-muted-foreground">Market Cap</div>
          <div className="text-lg font-semibold" data-testid={`stock-metric-${stock.ticker}`}>
            {stock.metric}
          </div>
        </div>
        
        {/* Industry Tags */}
        <div className="flex flex-wrap gap-2">
          <span className={`${industryInfo.color} px-3 py-1 rounded-full text-sm`}>
            {industryInfo.category}
          </span>
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
