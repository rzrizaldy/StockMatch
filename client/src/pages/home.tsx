import { Link } from "wouter";
import bullMascotImage from "@assets/home bull_1757793533798.png";
import stockMatchLogo from "@assets/image_1757787406146.png";
import backgroundOverlay from "@assets/image_1757787667608.png";

import Bull_Read from "@assets/Bull Read.png";

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
        <div className="w-[328px] text-center text-white text-lg font-medium leading-6 mb-12 px-4">Investing Made as Easy as Swiping</div>
        
        {/* Stock Card with Mascot */}
        <div className="relative mb-16">
          {/* Stock Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 w-[340px] relative">
            <div className="flex justify-between items-start mb-4">
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
              <div className="text-green-500 text-sm font-medium">+2.4%</div>
            </div>
            
            {/* 30-day trend & sentiment section */}
            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-2">30-day trend & sentiment</div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-gray-600">Price</span>
                <span className="text-gray-600">Sentiment</span>
                <span className="text-red-500">-4.71%</span>
                <span className="text-orange-500">25%</span>
              </div>
              
              {/* Simple chart representation */}
              <div className="relative h-16 mb-4 bg-gray-50 rounded-lg overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 280 60" preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke="#FFA726"
                    strokeWidth="2"
                    points="10,40 30,35 50,42 70,38 90,30 110,25 130,32 150,28 170,35 190,30 210,38 230,33 250,40 270,35"
                  />
                  <polyline
                    fill="none"
                    stroke="#66BB6A"
                    strokeWidth="2"
                    points="10,50 30,45 50,48 70,44 90,40 110,35 130,42 150,38 170,45 190,40 210,47 230,42 250,48 270,44"
                  />
                </svg>
              </div>
            </div>
            
            <div className="text-gray-600 text-sm leading-relaxed">
              There's talk of key breakout points in trading charts, which technical investors see as bullish indicators.
            </div>
          </div>
          
          
        </div>
        
        {/* Get Started Button */}
        <div className="w-[323px] absolute bottom-16">
          <Link href="/quiz">
            <button 
              data-testid="button-get-started"
              className="w-full bg-white text-[#57C30A] font-semibold text-lg py-4 rounded-full hover:bg-gray-50 transition-colors"
            >
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
