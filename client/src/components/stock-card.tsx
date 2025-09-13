import { useState, useRef, useEffect } from "react";
import type { StockCard as StockCardType } from "@shared/schema";
import StockChart from "./stock-chart";
import { Heart, Sparkles } from "lucide-react";

interface StockCardProps {
  stock: StockCardType;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  style?: React.CSSProperties;
}

// Generate sentiment index (0-100) based on stock data
const generateSentimentIndex = (stock: StockCardType): number => {
  // Use ticker and price change to generate a consistent sentiment score
  const tickerSeed = stock.ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Factor in price change if available
  let changeInfluence = 50; // neutral base
  if (stock.priceChange && typeof stock.priceChange === 'string') {
    const cleanedChange = stock.priceChange.replace(/[+%\s]/g, '');
    const changeValue = parseFloat(cleanedChange);
    if (!isNaN(changeValue)) {
      if (stock.priceChange.includes('+')) {
        changeInfluence = Math.min(85, 50 + Math.abs(changeValue) * 5);
      } else {
        changeInfluence = Math.max(15, 50 - Math.abs(changeValue) * 5);
      }
    }
  }
  
  // Combine ticker seed with price change influence for consistent but varied scores
  const baseScore = (tickerSeed % 40) + changeInfluence;
  return Math.min(100, Math.max(0, Math.round(baseScore)));
};

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
  const [isAnimatingLike, setIsAnimatingLike] = useState(false);
  const [isAnimatingPass, setIsAnimatingPass] = useState(false);
  const [logoError, setLogoError] = useState(false);
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

    // Enhanced physics with more natural movement
    const rotation = (deltaX / 8) * 3; // More subtle rotation
    const scale = 1 - Math.abs(deltaX) / 2000; // Slight scale effect
    const verticalOffset = Math.abs(deltaX) > 50 ? -Math.abs(deltaX) / 8 : 0; // Lift effect when swiping
    cardRef.current.style.transform = `translate(${deltaX}px, ${deltaY + verticalOffset}px) rotate(${rotation}deg) scale(${Math.max(scale, 0.95)})`;
  };

  const handleEnd = () => {
    if (!isDragging || !cardRef.current) return;

    setIsDragging(false);
    
    const threshold = 100;
    
    if (dragDistance > threshold) {
      if (dragDirection === 'right') {
        // Enhanced celebratory "Like" animation - fly upward with celebration
        setIsAnimatingLike(true);
        cardRef.current.style.transform = 'translateX(50vw) translateY(-150vh) rotate(25deg) scale(0.8)';
        cardRef.current.style.opacity = '0';
        cardRef.current.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.4s ease-out';
        setTimeout(onSwipeRight, 400);
      } else if (dragDirection === 'left') {
        // Enhanced swift "Pass" animation - clean dismissal
        setIsAnimatingPass(true);
        cardRef.current.style.transform = 'translateX(-120vw) rotate(-25deg) scale(0.9)';
        cardRef.current.style.opacity = '0';
        cardRef.current.style.transition = 'transform 0.4s cubic-bezier(0.55, 0.085, 0.68, 0.53), opacity 0.3s ease-out';
        setTimeout(onSwipeLeft, 300);
      } else {
        // Snap back to center with elastic feel
        cardRef.current.style.transform = 'translate(0, 0) rotate(0deg)';
        cardRef.current.style.transition = 'transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      }
    } else {
      // Snap back to center with elastic feel
      cardRef.current.style.transform = 'translate(0, 0) rotate(0deg)';
      cardRef.current.style.transition = 'transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
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

  // Get risk indicator with circle styling matching Figma
  const getRiskIndicator = (industry: string, priceChange?: string) => {
    // Default fallback for missing or invalid price change data
    const defaultRisk = { 
      circleClass: 'risk-circle-medium', 
      textClass: 'text-amber-600', 
      label: 'Medium Risk', 
      description: 'Moderate volatility'
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
      
      // Simple risk categorization with circle indicators
      if (industry.toLowerCase().includes('tech') || Math.abs(changeValue) > 5) {
        return { 
          circleClass: 'risk-circle-high', 
          textClass: 'text-red-600', 
          label: 'High Risk', 
          description: 'Higher volatility'
        };
      } else if (industry.toLowerCase().includes('healthcare') || industry.toLowerCase().includes('utility')) {
        return { 
          circleClass: 'risk-circle-low', 
          textClass: 'text-emerald-600', 
          label: 'Low Risk', 
          description: 'More stable'
        };
      } else {
        return { 
          circleClass: 'risk-circle-medium', 
          textClass: 'text-amber-600', 
          label: 'Medium Risk', 
          description: 'Moderate volatility'
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

  // Function to enhance sentiment text by bolding key terms - SECURE implementation
  const enhanceSentimentText = (text: string): JSX.Element => {
    const keyTerms = [
      'stable company', 'stability', 'stable', 'lower volatility', 'low volatility',
      'competition', 'competitive', 'growth potential', 'strong growth', 'growth',
      'market leader', 'innovation', 'innovative', 'dividend', 'profitable',
      'well-positioned', 'strong fundamentals', 'proven', 'resilient', 'defensive',
      'expanding market', 'market reach', 'brand recognition', 'consumer loyalty'
    ];
    
    // Sort by length (descending) to avoid partial matches
    const sortedTerms = keyTerms.sort((a, b) => b.length - a.length);
    
    // Find all matches with their positions
    const matches: Array<{start: number, end: number, term: string}> = [];
    
    sortedTerms.forEach(term => {
      const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      let match: RegExpExecArray | null;
      while ((match = regex.exec(text)) !== null) {
        // Check if this match overlaps with existing matches
        const overlaps = matches.some(existing => 
          (match!.index >= existing.start && match!.index < existing.end) ||
          (match!.index + match![0].length > existing.start && match!.index + match![0].length <= existing.end)
        );
        
        if (!overlaps) {
          matches.push({
            start: match.index,
            end: match.index + match[0].length,
            term: match[0]
          });
        }
      }
    });
    
    // Sort matches by position
    matches.sort((a, b) => a.start - b.start);
    
    // Build React elements array
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    
    matches.forEach((match, index) => {
      // Add text before the match
      if (match.start > lastIndex) {
        elements.push(text.slice(lastIndex, match.start));
      }
      
      // Add the highlighted term
      elements.push(
        <strong key={`highlight-${index}`}>{match.term}</strong>
      );
      
      lastIndex = match.end;
    });
    
    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex));
    }
    
    return <span>{elements}</span>;
  };

  const riskInfo = getRiskIndicator(stock.industry, stock.priceChange);
  const priceChangeStyle = getPriceChangeStyle(stock.priceChange);
  const sentimentIndex = generateSentimentIndex(stock);

  return (
    <div
      ref={cardRef}
      className="w-full h-[600px] bg-white rounded-2xl cursor-grab select-none transition-all duration-200 overflow-hidden"
      style={{
        ...style,
        boxShadow: '0px 8px 24px 0px rgba(0, 0, 0, 0.08)',
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
            <h2 className="font-din-ticker text-black mb-1 truncate" data-testid={`stock-ticker-${stock.ticker}`}>
              {stock.ticker}
            </h2>
            <p className="text-company-name text-gray-600 truncate" data-testid={`stock-name-${stock.ticker}`}>
              {stock.name}
            </p>
          </div>
          <div className="flex-shrink-0">
            <div 
              className="flex items-center gap-2"
              title={riskInfo.description}
            >
              <div className={`risk-circle ${riskInfo.circleClass}`}></div>
              <span className={`text-xs font-medium ${riskInfo.textClass}`}>{riskInfo.label}</span>
            </div>
          </div>
        </div>

        {/* Price, Change and Sentiment Index */}
        <div className="mb-4">
          <div className="flex items-end justify-between mb-1">
            <div className="text-price text-black" data-testid={`stock-price-${stock.ticker}`}>
              {stock.price || '$150.25'}
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">Sentiment</div>
              <div className="text-sm font-semibold text-black" data-testid={`sentiment-index-${stock.ticker}`}>
                {sentimentIndex}/100
              </div>
            </div>
          </div>
          <div className={`text-price-change ${priceChangeStyle}`} data-testid={`stock-change-${stock.ticker}`}>
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
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 h-20 flex items-center justify-center">
              <span className="text-xs text-gray-500">Chart data loading...</span>
            </div>
          )}
        </div>

        {/* AI Sentiment Summary */}
        <div className="flex-1 flex flex-col justify-center min-h-0">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 h-full flex flex-col">
            <h4 className="text-xs font-medium text-gray-600 mb-2">Why this might interest you:</h4>
            <div className="text-sm text-gray-900 leading-relaxed overflow-hidden" data-testid={`stock-sentiment-${stock.ticker}`}>
              {enhanceSentimentText(stock.sentimentSummary || stock.hook || getDefaultSentiment(stock))}
            </div>
          </div>
        </div>

        {/* Company Logo at Bottom */}
        <div className="mt-4 flex justify-center flex-shrink-0">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            {stock.logoUrl && !logoError ? (
              <img 
                src={stock.logoUrl} 
                alt={`${stock.name} logo`} 
                className="w-6 h-6 rounded object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-sm font-bold text-gray-600">{stock.ticker.charAt(0)}</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Enhanced Swipe Action Hints with Animations */}
      <div 
        className={`absolute top-4 right-4 transition-all duration-200 ${
          dragDirection === 'right' && dragDistance > 50 ? 'opacity-100 scale-110' : 'opacity-0 scale-100'
        }`}
      >
        <div className="bg-green-100 border-2 border-green-500 text-green-700 px-3 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 animate-pulse">
          <Heart className="w-3 h-3 fill-current" />
          LIKE
        </div>
      </div>
      <div 
        className={`absolute top-4 left-4 transition-all duration-200 ${
          dragDirection === 'left' && dragDistance > 50 ? 'opacity-100 scale-110' : 'opacity-0 scale-100'
        }`}
      >
        <div className="bg-red-100 border-2 border-red-500 text-red-700 px-3 py-2 rounded-full text-xs font-bold animate-pulse">
          PASS
        </div>
      </div>
      
      {/* Celebratory Heart Burst Effect */}
      {isAnimatingLike && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* Main Heart */}
          <div className="relative animate-ping">
            <Heart className="w-20 h-20 text-green-500 fill-current animate-bounce" />
          </div>
          {/* Burst Hearts */}
          <div className="absolute animate-pulse">
            <Heart className="w-8 h-8 text-green-500 fill-current absolute -top-8 -left-8 animate-bounce" style={{ animationDelay: '0.1s' }} />
            <Heart className="w-6 h-6 text-green-500 fill-current absolute -top-12 left-8 animate-bounce" style={{ animationDelay: '0.2s' }} />
            <Heart className="w-10 h-10 text-green-500 fill-current absolute top-8 -right-8 animate-bounce" style={{ animationDelay: '0.15s' }} />
            <Heart className="w-4 h-4 text-green-500 fill-current absolute -bottom-6 -left-6 animate-bounce" style={{ animationDelay: '0.25s' }} />
            <Heart className="w-7 h-7 text-green-500 fill-current absolute bottom-6 right-6 animate-bounce" style={{ animationDelay: '0.05s' }} />
          </div>
          {/* Sparkles */}
          <div className="absolute animate-spin">
            <Sparkles className="w-12 h-12 text-yellow-400 absolute -top-16 left-0 animate-pulse" style={{ animationDelay: '0.3s' }} />
            <Sparkles className="w-8 h-8 text-yellow-300 absolute top-16 -right-12 animate-pulse" style={{ animationDelay: '0.1s' }} />
            <Sparkles className="w-10 h-10 text-yellow-500 absolute -bottom-12 -left-12 animate-pulse" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      )}
      
      {/* Pass Animation Effect */}
      {isAnimatingPass && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-red-500 rounded-full animate-ping" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-red-500 font-bold text-lg">✕</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
