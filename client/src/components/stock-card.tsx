import { useState, useRef, useEffect } from "react";
import type { StockCard as StockCardType } from "@shared/schema";
import StockChart from "./stock-chart";
import { Shield, AlertTriangle, Flame } from "lucide-react";

interface StockCardProps {
  stock: StockCardType;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  style?: React.CSSProperties;
}

// Mock sentiment generator for smooth UX when AI fails
const getDefaultSentiment = (stock: StockCardType): string => {
  const sentiments = {
    tech: [
      "This tech innovator shows strong growth potential in the digital transformation space.",
      "A solid technology play with expanding market reach and competitive positioning.",
      "This company is well-positioned for the future of digital innovation and growth."
    ],
    healthcare: [
      "Healthcare companies offer stability and steady demand in all market conditions.",
      "This health sector leader provides essential services with defensive characteristics.", 
      "Strong fundamentals in the growing healthcare industry make this appealing."
    ],
    finance: [
      "Financial companies tend to be stable for long-term wealth building strategies.",
      "This established financial player offers dividend potential and market stability.",
      "Banking and finance sectors provide foundational stability to portfolios."
    ],
    consumer: [
      "Consumer brands with daily-use products tend to show resilient performance.",
      "This company serves everyday consumer needs with proven market demand.",
      "Strong consumer loyalty and brand recognition drive consistent returns."
    ],
    energy: [
      "Energy companies offer exposure to commodity cycles and infrastructure growth.",
      "This energy play provides diversification and potential inflation protection.",
      "The energy transition creates opportunities for established industry players."
    ],
    automotive: [
      "The automotive industry is transforming with electric vehicles and new technology.",
      "This company is positioned in the future of transportation and mobility.",
      "Strong engineering and innovation drive competitive advantages in automotive."
    ]
  };

  const industry = stock.industry.toLowerCase();
  const categoryKey = Object.keys(sentiments).find(key => industry.includes(key)) || 'tech';
  const options = sentiments[categoryKey as keyof typeof sentiments];
  
  // Use ticker as seed for consistent selection
  const seedValue = stock.ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return options[seedValue % options.length];
};

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

  // Get risk indicator with pill styling and icons
  const getRiskIndicator = (industry: string, priceChange?: string) => {
    // Default fallback for missing or invalid price change data
    const defaultRisk = { 
      bgColor: 'bg-yellow-500', 
      textColor: 'text-yellow-900', 
      label: 'Med Risk', 
      description: 'Moderate volatility',
      icon: AlertTriangle
    };
    
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
      
      // Simple risk categorization with icons and solid pill styling
      if (industry.toLowerCase().includes('tech') || Math.abs(changeValue) > 5) {
        return { 
          bgColor: 'bg-red-500', 
          textColor: 'text-red-50', 
          label: 'High Risk', 
          description: 'Higher volatility',
          icon: Flame
        };
      } else if (industry.toLowerCase().includes('healthcare') || industry.toLowerCase().includes('utility')) {
        return { 
          bgColor: 'bg-green-500', 
          textColor: 'text-green-50', 
          label: 'Low Risk', 
          description: 'More stable',
          icon: Shield
        };
      } else {
        return { 
          bgColor: 'bg-yellow-500', 
          textColor: 'text-yellow-900', 
          label: 'Med Risk', 
          description: 'Moderate volatility',
          icon: AlertTriangle
        };
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

  // Function to enhance sentiment text by bolding key terms
  const enhanceSentimentText = (text: string): JSX.Element => {
    const keyTerms = [
      'stable company', 'stability', 'stable', 'lower volatility', 'low volatility',
      'competition', 'competitive', 'growth potential', 'strong growth', 'growth',
      'market leader', 'innovation', 'innovative', 'dividend', 'profitable',
      'well-positioned', 'strong fundamentals', 'proven', 'resilient', 'defensive',
      'expanding market', 'market reach', 'brand recognition', 'consumer loyalty'
    ];
    
    let enhancedText = text;
    
    // Sort by length (descending) to avoid partial matches
    const sortedTerms = keyTerms.sort((a, b) => b.length - a.length);
    
    sortedTerms.forEach(term => {
      const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      enhancedText = enhancedText.replace(regex, `<strong>$&</strong>`);
    });
    
    return <span dangerouslySetInnerHTML={{ __html: enhancedText }} />;
  };

  const riskInfo = getRiskIndicator(stock.industry, stock.priceChange);
  const priceChangeStyle = getPriceChangeStyle(stock.priceChange);
  const RiskIcon = riskInfo.icon;

  return (
    <div
      ref={cardRef}
      className="w-full h-[600px] bg-card rounded-2xl shadow-xl border border-border cursor-grab select-none transition-all duration-200 overflow-hidden"
      style={{
        ...style,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      data-testid={`stock-card-${stock.ticker}`}
    >
      <div className="flex flex-col h-full p-6">
        {/* Header: Ticker and Risk Indicator */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-foreground mb-1 truncate" data-testid={`stock-ticker-${stock.ticker}`}>
              {stock.ticker}
            </h2>
            <p className="text-sm text-muted-foreground truncate" data-testid={`stock-name-${stock.ticker}`}>
              {stock.name}
            </p>
          </div>
          <div className="flex-shrink-0">
            <div 
              className={`${riskInfo.bgColor} ${riskInfo.textColor} px-3 py-2 rounded-full flex items-center gap-2 shadow-sm`}
              title={riskInfo.description}
            >
              <RiskIcon className="w-3 h-3" />
              <span className="text-xs font-bold">{riskInfo.label}</span>
            </div>
          </div>
        </div>

        {/* Price and Change */}
        <div className="mb-4">
          <div className="text-3xl font-bold text-foreground mb-1" data-testid={`stock-price-${stock.ticker}`}>
            {stock.price || '$150.25'}
          </div>
          <div className={`text-sm font-medium ${priceChangeStyle}`} data-testid={`stock-change-${stock.ticker}`}>
            {stock.priceChange || '+2.5%'}
          </div>
        </div>

        {/* Price Chart */}
        <div className="mb-4">
          {stock.chartData && stock.chartData.length > 0 ? (
            <StockChart 
              data={stock.chartData.map(price => parseFloat(price))}
              currentPrice={parseFloat(stock.price?.replace('$', '') || '0')}
              priceChange={stock.priceChange}
              ticker={stock.ticker}
            />
          ) : (
            <div className="bg-muted/30 rounded-lg p-3 border border-border/30 h-20 flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Chart data loading...</span>
            </div>
          )}
        </div>

        {/* AI Sentiment Summary */}
        <div className="flex-1 flex flex-col justify-center min-h-0">
          <div className="bg-muted/50 rounded-lg p-4 border border-border/50 h-full flex flex-col">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Why this might interest you:</h4>
            <div className="text-sm text-foreground leading-relaxed overflow-hidden" data-testid={`stock-sentiment-${stock.ticker}`}>
              {enhanceSentimentText(stock.sentimentSummary || stock.hook || getDefaultSentiment(stock))}
            </div>
          </div>
        </div>

        {/* Company Logo at Bottom */}
        <div className="mt-4 flex justify-center flex-shrink-0">
          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
            {stock.logoUrl ? (
              <img 
                src={stock.logoUrl} 
                alt={`${stock.name} logo`} 
                className="w-6 h-6 rounded object-contain"
                onError={(e) => {
                  // Fallback to ticker if logo fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<span class="text-sm font-bold text-muted-foreground">${stock.ticker.charAt(0)}</span>`;
                  }
                }}
              />
            ) : (
              <span className="text-sm font-bold text-muted-foreground">{stock.ticker.charAt(0)}</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Swipe Action Hints */}
      <div 
        className={`absolute top-4 right-4 transition-opacity duration-200 ${
          dragDirection === 'right' && dragDistance > 50 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="bg-secondary/20 border-2 border-secondary text-secondary px-2 py-1 rounded-full text-xs font-medium">
          LIKE
        </div>
      </div>
      <div 
        className={`absolute top-4 left-4 transition-opacity duration-200 ${
          dragDirection === 'left' && dragDistance > 50 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="bg-destructive/20 border-2 border-destructive text-destructive px-2 py-1 rounded-full text-xs font-medium">
          PASS
        </div>
      </div>
    </div>
  );
}
