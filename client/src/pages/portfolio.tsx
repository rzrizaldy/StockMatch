import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { RefreshCw, AlertTriangle, FileSpreadsheet, Share2 } from "lucide-react";
import mascotImage from "@assets/image_1757788388059.png";
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

  const { data: userProfile } = useQuery({
    queryKey: ['/api/user-profile', sessionId],
    queryFn: () => api.getUserProfile(sessionId!),
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
    <div className="w-full h-screen overflow-hidden relative" style={{ background: 'linear-gradient(59deg, #57C30A 0%, white 86%)' }}>
      {/* Background Decorative Elements */}
      {/* Large background circle */}
      <div 
        className="absolute bg-[#B6D8B6] rounded-full"
        style={{ 
          width: '584.76px', 
          height: '394.58px', 
          left: '-125px', 
          top: '-122px'
        }}
      ></div>
      
      {/* Scattered celebration elements - exact positioning from Figma */}
      <div className="absolute bg-[#57C30A]" style={{ width: '24px', height: '20px', left: '304px', top: '76px' }}></div>
      <div className="absolute bg-[#57C30A]" style={{ width: '32px', height: '20px', left: '273px', top: '232px' }}></div>
      <div className="absolute bg-[#57C30A]" style={{ width: '16px', height: '24px', left: '453px', top: '80px' }}></div>
      <div className="absolute bg-[#57C30A]" style={{ width: '16px', height: '24px', left: '169px', top: '279px' }}></div>
      <div className="absolute bg-[#57C30A]" style={{ width: '16px', height: '24px', left: '484px', top: '268px' }}></div>
      <div className="absolute bg-[#57C30A]" style={{ width: '16px', height: '28px', left: '469px', top: '166px' }}></div>
      <div className="absolute bg-[#57C30A]" style={{ width: '20px', height: '36px', left: '437px', top: '232px' }}></div>
      <div className="absolute bg-[#B1D671]" style={{ width: '8px', height: '12px', left: '400px', top: '80px' }}></div>
      <div className="absolute bg-[#B1D671]" style={{ width: '8px', height: '12px', left: '288px', top: '268px' }}></div>
      <div className="absolute bg-[#B1D671]" style={{ width: '12px', height: '8px', left: '492px', top: '108px' }}></div>
      <div className="absolute bg-[#B1D671]" style={{ width: '12px', height: '8px', left: '452px', top: '316px' }}></div>
      <div className="absolute bg-[#57C30A]" style={{ width: '12px', height: '8px', left: '320px', top: '300px' }}></div>
      <div className="absolute bg-[#57C30A]" style={{ width: '8px', height: '8px', left: '440px', top: '140px' }}></div>
      <div className="absolute bg-[#57C30A]" style={{ width: '8px', height: '8px', left: '352px', top: '92px' }}></div>
      <div className="absolute bg-[#57C30A]" style={{ width: '8px', height: '8px', left: '420px', top: '284px' }}></div>
      <div className="absolute bg-[#57C30A]" style={{ width: '8px', height: '8px', left: '320px', top: '188px' }}></div>
      <div className="absolute bg-[#57C30A]" style={{ width: '8px', height: '8px', left: '500px', top: '236px' }}></div>
      <div className="absolute bg-[#B1D671]" style={{ width: '12px', height: '8px', left: '400px', top: '140px' }}></div>
      <div className="absolute bg-[#57C30A]" style={{ width: '8px', height: '12px', left: '508px', top: '332px' }}></div>
      <div className="absolute bg-[#023341]" style={{ width: '12px', height: '12px', left: '400px', top: '156px' }}></div>
      <div className="absolute bg-[#57C30A]" style={{ width: '12px', height: '28px', left: '204px', top: '92px' }}></div>
      
      {/* Mascot Image */}
      <img 
        src={mascotImage} 
        alt="Portfolio Mascot"
        className="absolute"
        style={{ 
          width: '116px', 
          height: '139px', 
          left: '129px', 
          top: '102px'
        }}
      />
      
      {/* Top Reset Button */}
      <button
        onClick={handleReset}
        className="absolute top-6 right-6 z-50 text-white/80 hover:text-white bg-white/10 rounded-lg p-2 backdrop-blur-sm transition-colors"
        data-testid="button-reset"
      >
        <RefreshCw className="w-5 h-5" />
      </button>
      
      {/* Main Content - Centered Text */}
      <div className="absolute inset-x-0 text-center" style={{ top: '260px' }}>
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
      
      {/* White Bottom Section */}
      <div 
        className="absolute inset-x-0 bottom-0 bg-white overflow-y-auto"
        style={{ 
          top: '390px',
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
              {stocks.map((stock, index) => (
                <div key={stock.ticker} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg" data-testid={`company-${stock.ticker}`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      {stock.logoUrl ? (
                        <img src={stock.logoUrl} alt={stock.name} className="w-8 h-8 rounded" />
                      ) : (
                        <span className="text-lg font-bold text-primary">
                          {stock.ticker.charAt(0)}
                        </span>
                      )}
                    </div>
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
          
          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleSharePortfolio}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              data-testid="button-share-portfolio"
            >
              <Share2 className="w-5 h-5" />
              Share Portfolio
            </button>
            <button
              onClick={handleExportToSheets}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              data-testid="button-export-sheets"
            >
              <FileSpreadsheet className="w-5 h-5" />
              Export to Sheets
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
  );
}