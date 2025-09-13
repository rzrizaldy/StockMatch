import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { stockCards } from "@shared/schema";

interface CSVStock {
  'Nasdaq Traded': string;
  'Symbol': string;
  'Security Name': string;
  'Listing Exchange': string;
  'Market Category': string;
  'ETF': string;
  'Round Lot Size': string;
  'Test Issue': string;
  'Financial Status': string;
  'CQS Symbol': string;
  'NASDAQ Symbol': string;
  'NextShares': string;
  'ESG': string;
}

// Generate realistic price data for the last 30 days
function generatePriceHistory(basePrice: number, volatility: number = 0.02): string[] {
  const prices: string[] = [];
  let currentPrice = basePrice;
  
  for (let i = 30; i >= 0; i--) {
    // Add some random walk with mean reversion
    const change = (Math.random() - 0.5) * volatility * 2;
    currentPrice = currentPrice * (1 + change);
    prices.unshift(currentPrice.toFixed(2));
  }
  
  return prices;
}

// Generate pseudo sentiment data
function generateSentimentData(ticker: string, category: string) {
  // Use ticker hash for consistent pseudo-random data
  const hash = ticker.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const random = Math.abs(hash) / 2147483647;
  
  // Sentiment score 0-100
  const sentimentScore = Math.floor(40 + (random * 60)); // Bias towards positive
  
  // Base price varies by category
  const basePrices: Record<string, number> = {
    'TECHNOLOGY': 150 + (random * 200),
    'HEALTHCARE': 80 + (random * 150),
    'FINANCE': 60 + (random * 100),
    'CONSUMER': 50 + (random * 80),
    'ENERGY': 70 + (random * 60),
    'default': 30 + (random * 70)
  };
  
  const basePrice = basePrices[category] || basePrices['default'];
  const price = basePrice.toFixed(2);
  const priceChange = ((random - 0.5) * 10).toFixed(2);
  
  // Generate market data
  const marketCap = Math.floor(1000 + (random * 50000)); // 1B to 50B range
  const beta = (0.5 + (random * 1.5)).toFixed(2);
  const esgScore = Math.floor(3 + (random * 7)).toFixed(1); // 3-10 ESG score
  const volatility = (0.1 + (random * 0.4)).toFixed(3);
  const averageVolume = Math.floor(100000 + (random * 5000000));
  
  const chartData = generatePriceHistory(basePrice, parseFloat(volatility));
  const fiftyTwoWeekHigh = (basePrice * (1.1 + random * 0.4)).toFixed(2);
  const fiftyTwoWeekLow = (basePrice * (0.6 + random * 0.3)).toFixed(2);
  
  return {
    sentimentScore: sentimentScore.toString(),
    price: `$${price}`,
    priceChange: `${parseFloat(priceChange) >= 0 ? '+' : ''}${priceChange}%`,
    marketCap: `$${marketCap}B`,
    beta,
    esgScore,
    volatility,
    averageVolume: averageVolume.toString(),
    chartData,
    fiftyTwoWeekHigh: `$${fiftyTwoWeekHigh}`,
    fiftyTwoWeekLow: `$${fiftyTwoWeekLow}`
  };
}

// Generate hooks and descriptions
function generateStockHook(name: string, category: string): string {
  const hooks: Record<string, string[]> = {
    'TECHNOLOGY': [
      'Leading innovator in digital transformation and cloud computing solutions.',
      'Develops cutting-edge software and hardware for modern enterprises.',
      'Pioneer in artificial intelligence and machine learning technologies.',
      'Creates platforms that connect millions of users worldwide.',
      'Designs next-generation chips and processors for computing.'
    ],
    'HEALTHCARE': [
      'Develops life-saving medications and medical devices.',
      'Leading provider of innovative healthcare solutions and services.',
      'Pioneers breakthrough treatments for critical diseases.',
      'Manufactures essential medical equipment and diagnostics.',
      'Focused on improving patient outcomes through innovation.'
    ],
    'FINANCE': [
      'Provides comprehensive banking and financial services globally.',
      'Leading investment and wealth management solutions.',
      'Innovative digital payment and fintech services.',
      'Offers insurance and risk management solutions.',
      'Facilitates global commerce and financial transactions.'
    ],
    'CONSUMER': [
      'Creates beloved consumer products and brands worldwide.',
      'Leading retailer offering convenient shopping experiences.',
      'Manufactures everyday essentials and lifestyle products.',
      'Delivers exceptional customer experiences and value.',
      'Innovates in sustainable consumer goods and services.'
    ],
    'ENERGY': [
      'Leading provider of clean and renewable energy solutions.',
      'Explores and produces essential energy resources globally.',
      'Develops sustainable energy infrastructure and technology.',
      'Delivers reliable energy solutions for communities worldwide.',
      'Pioneers the transition to cleaner energy sources.'
    ]
  };
  
  const categoryHooks = hooks[category] || hooks['CONSUMER'];
  const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return categoryHooks[hash % categoryHooks.length];
}

function generateMetric(category: string, sentimentData: any): string {
  const metrics: Record<string, string[]> = {
    'TECHNOLOGY': ['P/E: 25.3', 'Revenue Growth: +18%', 'R&D Spend: $2.1B', 'User Growth: +22%'],
    'HEALTHCARE': ['Pipeline: 15 drugs', 'FDA Approvals: 3', 'R&D: $1.8B', 'Market Access: 85%'],
    'FINANCE': ['ROE: 12.5%', 'Loan Growth: +8%', 'NIM: 3.2%', 'Efficiency: 58%'],
    'CONSUMER': ['Same-Store Sales: +5%', 'Brand Value: $12B', 'Market Share: 18%', 'Margin: 15%'],
    'ENERGY': ['Production: 2.1M bbl/d', 'Reserves: 12B bbl', 'Breakeven: $45', 'Dividend: 6.2%']
  };
  
  const categoryMetrics = metrics[category] || metrics['CONSUMER'];
  const hash = parseInt(sentimentData.sentimentScore);
  return categoryMetrics[hash % categoryMetrics.length];
}

async function loadStockData() {
  console.log('Starting stock data load...');
  
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  
  // Setup database connection
  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);
  
  // Read and parse CSV
  const csvContent = readFileSync('../attached_assets/stock_metadata_1757782098204.csv', 'utf-8');
  const records: CSVStock[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true
  });
  
  console.log(`Found ${records.length} stocks in CSV`);
  
  // Filter for common stocks (no ETFs, no test issues)
  const filteredStocks = records.filter(stock => 
    stock['Nasdaq Traded'] === 'Y' &&
    stock['ETF'] === 'N' &&
    stock['Test Issue'] === 'N' &&
    stock['Symbol'].length <= 5 && // Exclude long symbols
    !stock['Symbol'].includes('.') && // Exclude symbols with dots
    stock['Security Name'] && 
    stock['Security Name'].length > 5 // Exclude very short names
  );
  
  console.log(`Filtered to ${filteredStocks.length} regular stocks`);
  
  // Process in batches to avoid overwhelming the database
  const batchSize = 50;
  const totalBatches = Math.ceil(Math.min(filteredStocks.length, 500) / batchSize); // Limit to 500 stocks for demo
  
  for (let i = 0; i < totalBatches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, Math.min(filteredStocks.length, 500));
    const batch = filteredStocks.slice(start, end);
    
    console.log(`Processing batch ${i + 1}/${totalBatches} (${start}-${end})`);
    
    const stockData = batch.map(stock => {
      const sentimentData = generateSentimentData(stock.Symbol, stock['Market Category']);
      const hook = generateStockHook(stock['Security Name'], stock['Market Category']);
      const metric = generateMetric(stock['Market Category'], sentimentData);
      
      // Generate beginner-friendly sentiment summary
      const sentimentScore = parseInt(sentimentData.sentimentScore);
      let sentimentSummary = '';
      if (sentimentScore >= 70) {
        sentimentSummary = `Strong performer with positive market outlook. Recent trends show ${sentimentData.priceChange} growth and solid fundamentals.`;
      } else if (sentimentScore >= 50) {
        sentimentSummary = `Stable investment with moderate growth potential. Trading at ${sentimentData.price} with balanced risk profile.`;
      } else {
        sentimentSummary = `Value opportunity with potential upside. Currently trading below recent highs but showing signs of recovery.`;
      }
      
      return {
        ticker: stock.Symbol,
        name: stock['Security Name'],
        logoUrl: `https://logo.clearbit.com/${stock.Symbol.toLowerCase()}.com`, // Placeholder logo service
        hook,
        metric,
        industry: stock['Market Category'].toLowerCase(),
        marketCap: sentimentData.marketCap,
        beta: sentimentData.beta,
        esgScore: sentimentData.esgScore,
        price: sentimentData.price,
        priceChange: sentimentData.priceChange,
        sentimentSummary,
        chartData: sentimentData.chartData,
        
        // CSV metadata
        listingExchange: stock['Listing Exchange'],
        marketCategory: stock['Market Category'],
        etf: stock['ETF'] === 'Y',
        roundLotSize: stock['Round Lot Size'],
        financialStatus: stock['Financial Status'] || null,
        nasdaqTraded: stock['Nasdaq Traded'] === 'Y',
        
        // Generated sentiment and market data
        sentimentScore: sentimentData.sentimentScore,
        volatility: sentimentData.volatility,
        averageVolume: sentimentData.averageVolume,
        fiftyTwoWeekHigh: sentimentData.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: sentimentData.fiftyTwoWeekLow
      };
    });
    
    try {
      await db.insert(stockCards).values(stockData).onConflictDoNothing();
      console.log(`Inserted batch ${i + 1} successfully`);
    } catch (error) {
      console.error(`Error inserting batch ${i + 1}:`, error);
      // Continue with next batch
    }
  }
  
  console.log('Stock data load complete!');
}

// Run the loader if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  loadStockData().catch(console.error);
}

export { loadStockData };