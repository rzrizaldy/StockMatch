import { Link } from "wouter";
import mascotImage from "@assets/image_1757787375430.png";
import stockMatchLogo from "@assets/image_1757787406146.png";
import backgroundOverlay from "@assets/image_1757787667608.png";

export default function Home() {
  return (
    <div className="w-full h-screen relative bg-[#8BC34A] overflow-hidden">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-80"
        style={{ backgroundImage: `url(${backgroundOverlay})` }}
      />
      {/* Main Content Container */}
      <div className="w-full h-full relative flex flex-col items-center">
        {/* StockMatch Logo */}
        <div className="mt-16 mb-8">
          <img 
            src={stockMatchLogo}
            alt="StockMatch Logo"
            className="w-[280px] h-auto"
          />
        </div>
        
        {/* Description Text */}
        <div className="w-[328px] text-center text-white text-lg font-medium leading-6 mb-12 px-4">
          Swipe left on the companies you love, left those you don't. We'll create personalized portfolio for you.
        </div>
        
        {/* Stock Card with Mascot */}
        <div className="relative mb-16">
          {/* Stock Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 w-[280px] relative">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-2xl font-bold text-gray-800">TSLA</div>
                <div className="text-gray-500 text-sm">Tesla Inc.</div>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <span className="text-sm text-gray-600">Medium Risk</span>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-3xl font-bold text-gray-800">$283.41</div>
              <div className="text-green-500 text-sm">+2.4%</div>
            </div>
            
            <div className="text-gray-600 text-sm leading-relaxed">
              There's talk of key breakout points in trading charts, which technical investors see as bullish indicators.
            </div>
          </div>
          
          {/* Mascot positioned on the card */}
          <div className="absolute -bottom-4 -right-4">
            <img 
              src={mascotImage}
              alt="StockMatch Mascot"
              className="w-20 h-20"
            />
          </div>
        </div>
        
        {/* Get Started Button */}
        <div className="w-[323px] absolute bottom-16 space-y-4">
          <Link href="/quiz">
            <button 
              data-testid="button-get-started"
              className="w-full bg-white text-[#57C30A] font-semibold text-lg py-4 rounded-full hover:bg-gray-50 transition-colors"
            >
              Get Started
            </button>
          </Link>
          
          {/* Temporary Test Link */}
          <Link href="/sentiment-test">
            <button 
              data-testid="button-sentiment-test"
              className="w-full bg-blue-600 text-white font-semibold text-sm py-3 rounded-full hover:bg-blue-700 transition-colors"
            >
              Test Sentiment Charts
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
