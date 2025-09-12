import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserProfileSchema, insertPortfolioSchema } from "@shared/schema";

// Curated fake stock data for demo purposes
const STOCK_DATABASE = [
  // Technology Companies
  { ticker: "AAPL", name: "Apple Inc.", industry: "Technology", marketCap: 3000, beta: 1.2, logo: "🍎", hook: "Designs and sells iconic consumer electronics, software, and digital services worldwide.", esgScore: 8.5 },
  { ticker: "MSFT", name: "Microsoft Corporation", industry: "Technology", marketCap: 2800, beta: 0.9, logo: "🪟", hook: "Develops productivity software, cloud computing, and gaming platforms for businesses and consumers.", esgScore: 8.8 },
  { ticker: "GOOGL", name: "Alphabet Inc.", industry: "Technology", marketCap: 1900, beta: 1.1, logo: "🌐", hook: "Operates the world's largest search engine and provides cloud computing and digital advertising services.", esgScore: 7.9 },
  { ticker: "META", name: "Meta Platforms Inc.", industry: "Technology", marketCap: 800, beta: 1.4, logo: "📘", hook: "Connects billions of people through social media platforms and develops virtual reality technologies.", esgScore: 6.2 },
  { ticker: "TSLA", name: "Tesla Inc.", industry: "Automotive", marketCap: 700, beta: 2.1, logo: "⚡", hook: "Designs and manufactures electric vehicles, energy storage systems, and renewable energy solutions.", esgScore: 9.1 },
  { ticker: "NVDA", name: "NVIDIA Corporation", industry: "Technology", marketCap: 1200, beta: 1.8, logo: "🎮", hook: "Creates graphics processing units for gaming, data centers, and artificial intelligence applications.", esgScore: 7.6 },
  { ticker: "AMZN", name: "Amazon.com Inc.", industry: "Consumer", marketCap: 1600, beta: 1.3, logo: "📦", hook: "Operates the world's largest e-commerce platform and provides cloud computing services globally.", esgScore: 7.2 },
  { ticker: "NFLX", name: "Netflix Inc.", industry: "Entertainment", marketCap: 200, beta: 1.5, logo: "🎬", hook: "Streams movies and TV shows to millions of subscribers worldwide on demand.", esgScore: 7.8 },
  
  // Healthcare Companies  
  { ticker: "JNJ", name: "Johnson & Johnson", industry: "Healthcare", marketCap: 450, beta: 0.7, logo: "🏥", hook: "Develops pharmaceutical products, medical devices, and consumer healthcare solutions globally.", esgScore: 8.7 },
  { ticker: "UNH", name: "UnitedHealth Group", industry: "Healthcare", marketCap: 500, beta: 0.8, logo: "💊", hook: "Provides health insurance coverage and healthcare services to millions of Americans.", esgScore: 8.1 },
  { ticker: "PFE", name: "Pfizer Inc.", industry: "Healthcare", marketCap: 280, beta: 0.6, logo: "🧬", hook: "Discovers, develops, and manufactures innovative medicines and vaccines for global health.", esgScore: 8.9 },
  
  // Finance Companies
  { ticker: "JPM", name: "JPMorgan Chase & Co.", industry: "Finance", marketCap: 420, beta: 1.1, logo: "🏦", hook: "Provides investment banking, asset management, and consumer banking services worldwide.", esgScore: 7.3 },
  { ticker: "V", name: "Visa Inc.", industry: "Finance", marketCap: 480, beta: 0.9, logo: "💳", hook: "Operates the world's largest electronic payments network facilitating digital transactions.", esgScore: 8.0 },
  { ticker: "MA", name: "Mastercard Inc.", industry: "Finance", marketCap: 380, beta: 1.0, logo: "💰", hook: "Processes payments and provides technology services for digital commerce worldwide.", esgScore: 8.2 },
  
  // Consumer Companies
  { ticker: "WMT", name: "Walmart Inc.", industry: "Consumer", marketCap: 420, beta: 0.5, logo: "🛒", hook: "Operates retail stores and e-commerce platforms offering everyday low prices globally.", esgScore: 7.5 },
  { ticker: "PG", name: "Procter & Gamble", industry: "Consumer", marketCap: 380, beta: 0.6, logo: "🧴", hook: "Manufactures and markets consumer goods including household and personal care products.", esgScore: 8.6 },
  { ticker: "KO", name: "The Coca-Cola Company", industry: "Consumer", marketCap: 260, beta: 0.6, logo: "🥤", hook: "Produces and distributes non-alcoholic beverages and syrups worldwide for over a century.", esgScore: 7.8 },
  { ticker: "NKE", name: "Nike Inc.", industry: "Consumer", marketCap: 180, beta: 1.0, logo: "👟", hook: "Designs, develops, and sells athletic footwear, apparel, and equipment globally.", esgScore: 8.3 },
  
  // Energy Companies
  { ticker: "XOM", name: "Exxon Mobil Corporation", industry: "Energy", marketCap: 460, beta: 1.4, logo: "⛽", hook: "Explores, produces, and refines oil and natural gas while developing low-carbon solutions.", esgScore: 6.1 },
  { ticker: "CVX", name: "Chevron Corporation", industry: "Energy", marketCap: 340, beta: 1.2, logo: "🛢️", hook: "Integrated energy company engaged in oil and gas exploration, production, and refining.", esgScore: 6.5 },
  
  // Additional Tech Companies
  { ticker: "ORCL", name: "Oracle Corporation", industry: "Technology", marketCap: 320, beta: 1.1, logo: "🗄️", hook: "Develops database software and cloud computing services for enterprises worldwide.", esgScore: 7.7 },
  { ticker: "ADBE", name: "Adobe Inc.", industry: "Technology", marketCap: 220, beta: 1.2, logo: "🎨", hook: "Creates digital media and marketing software solutions for creative professionals and businesses.", esgScore: 8.4 },
  { ticker: "CRM", name: "Salesforce Inc.", industry: "Technology", marketCap: 200, beta: 1.3, logo: "☁️", hook: "Provides cloud-based customer relationship management software and business automation tools.", esgScore: 9.0 },
  { ticker: "AMD", name: "Advanced Micro Devices", industry: "Technology", marketCap: 240, beta: 1.9, logo: "🔥", hook: "Designs and manufactures computer processors and graphics cards for PCs and data centers.", esgScore: 7.4 },
];

interface StockData {
  ticker: string;
  name: string;
  industry: string;
  marketCap: number;
  beta: number;
  logo: string;
  hook: string;
  esgScore: number;
}

function mapIndustryToCategories(industry: string): string[] {
  const industryMap: Record<string, string[]> = {
    "Technology": ["tech"],
    "Software": ["tech"],
    "Hardware": ["tech"],
    "Internet": ["tech"],
    "Semiconductors": ["tech"],
    "Healthcare": ["healthcare"],
    "Pharmaceuticals": ["healthcare"],
    "Biotechnology": ["healthcare"],
    "Medical": ["healthcare"],
    "Finance": ["finance"],
    "Banking": ["finance"],
    "Insurance": ["finance"],
    "Real Estate": ["finance"],
    "Consumer": ["consumer"],
    "Retail": ["consumer"],
    "Food": ["consumer"],
    "Automotive": ["consumer"],
    "Energy": ["energy"],
    "Oil": ["energy"],
    "Utilities": ["energy"],
    "Entertainment": ["entertainment"],
    "Media": ["entertainment"],
    "Gaming": ["entertainment"]
  };

  for (const [key, categories] of Object.entries(industryMap)) {
    if (industry.toLowerCase().includes(key.toLowerCase())) {
      return categories;
    }
  }
  
  return ["consumer"]; // default category
}

function getStocksByRisk(risk: string): StockData[] {
  const conservative = STOCK_DATABASE.filter(stock => stock.beta <= 1.0);
  const aggressive = STOCK_DATABASE.filter(stock => stock.beta > 1.5);
  const balanced = STOCK_DATABASE.filter(stock => stock.beta > 1.0 && stock.beta <= 1.5);

  switch (risk) {
    case "conservative":
      return [...conservative, ...balanced.slice(0, 3)];
    case "aggressive":
      return [...aggressive, ...balanced.slice(0, 3)];
    case "balanced":
    default:
      return [...balanced, ...conservative.slice(0, 3), ...aggressive.slice(0, 3)];
  }
}

function getStocksByIndustries(stocks: StockData[], industries: string[]): StockData[] {
  if (!industries || industries.length === 0) return stocks;
  
  const industryMap: Record<string, string[]> = {
    "tech": ["Technology"],
    "healthcare": ["Healthcare"],
    "finance": ["Finance"],
    "consumer": ["Consumer"],
    "energy": ["Energy"],
    "entertainment": ["Entertainment"]
  };

  const targetIndustries = industries.flatMap(industry => industryMap[industry] || []);
  
  return stocks.filter(stock => 
    targetIndustries.length === 0 || targetIndustries.includes(stock.industry)
  );
}

function getStocksByESG(stocks: StockData[], esg: boolean): StockData[] {
  if (!esg) return stocks;
  return stocks.filter(stock => stock.esgScore >= 7.5);
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get personalized stock deck
  app.post("/api/get-stock-deck", async (req, res) => {
    try {
      const profile = insertUserProfileSchema.parse(req.body);
      
      // Get stocks based on risk preference
      let availableStocks = getStocksByRisk(profile.risk);
      
      // Filter by industries if specified
      if (profile.industries && profile.industries.length > 0) {
        availableStocks = getStocksByIndustries(availableStocks, profile.industries);
      }
      
      // Filter by ESG preferences
      if (profile.esg) {
        availableStocks = getStocksByESG(availableStocks, profile.esg);
      }
      
      // Ensure we have enough stocks, add more if needed
      if (availableStocks.length < 15) {
        const additionalStocks = STOCK_DATABASE.filter(stock => 
          !availableStocks.find(existing => existing.ticker === stock.ticker)
        );
        availableStocks = [...availableStocks, ...additionalStocks];
      }
      
      // Shuffle and take 15 stocks
      const shuffled = availableStocks.sort(() => 0.5 - Math.random());
      const selectedStocks = shuffled.slice(0, 15);
      
      const stockCards = [];
      
      for (const stock of selectedStocks) {
        const card = {
          ticker: stock.ticker,
          name: stock.name,
          logoUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${stock.ticker}`, // Generate consistent logo
          hook: stock.hook,
          metric: `Market Cap: $${stock.marketCap}B`,
          industry: stock.industry,
          marketCap: stock.marketCap.toString(),
          beta: stock.beta.toString(),
          esgScore: stock.esgScore.toString()
        };
        
        stockCards.push(card);
        
        // Store in memory for later retrieval
        await storage.createStockCard(card);
      }
      
      res.json(stockCards);
      
    } catch (error) {
      console.error("Error generating stock deck:", error);
      res.status(500).json({ 
        message: "Failed to generate stock deck. Please check your API configuration.",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Save user profile
  app.post("/api/user-profile", async (req, res) => {
    try {
      const profile = insertUserProfileSchema.parse(req.body);
      const savedProfile = await storage.createUserProfile(profile);
      res.json(savedProfile);
    } catch (error) {
      console.error("Error saving user profile:", error);
      res.status(400).json({ 
        message: "Invalid profile data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Save portfolio
  app.post("/api/portfolio", async (req, res) => {
    try {
      const portfolio = insertPortfolioSchema.parse(req.body);
      const savedPortfolio = await storage.createPortfolio(portfolio);
      
      // Get detailed stock information for the portfolio
      const stockCards = await storage.getStockCardsByTickers(portfolio.likedStocks || []);
      
      res.json({
        portfolio: savedPortfolio,
        stocks: stockCards
      });
    } catch (error) {
      console.error("Error saving portfolio:", error);
      res.status(400).json({ 
        message: "Invalid portfolio data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get portfolio by session
  app.get("/api/portfolio/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const portfolio = await storage.getPortfolio(sessionId);
      
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }
      
      const stockCards = await storage.getStockCardsByTickers(portfolio.likedStocks || []);
      
      res.json({
        portfolio,
        stocks: stockCards
      });
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ 
        message: "Failed to fetch portfolio",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
