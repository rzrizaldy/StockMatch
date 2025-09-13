import { apiRequest } from "./queryClient";
import type { InsertUserProfile, InsertPortfolio, StockCard } from "@shared/schema";

export interface GetStockDeckRequest {
  sessionId: string;
  risk: string;
  industries: string[];
  esg: boolean;
}

export interface PortfolioResponse {
  portfolio: {
    id: string;
    sessionId: string;
    likedStocks: string[];
    totalValue: string;
  };
  stocks: StockCard[];
}

export interface SentimentAnalysisData {
  ticker: string;
  name: string;
  overallScore: number; // -1 to 1 scale (-1 very negative, 0 neutral, 1 very positive)
  confidenceLevel: number; // 0 to 1 scale (how confident the AI is in its analysis)
  keyInsights: string[]; // Array of 3-5 key insights about the stock's sentiment
  marketTrend: 'bullish' | 'bearish' | 'neutral';
  riskFactors: string[]; // Array of 2-3 main risk factors
  opportunities: string[]; // Array of 2-3 main opportunities
  timeHorizon: 'short-term' | 'medium-term' | 'long-term'; // Best investment timeframe
  recommendation: string; // Overall recommendation summary
}

export interface SentimentAnalysisResponse {
  analyses: SentimentAnalysisData[];
  totalRequested: number;
  successfulCount: number;
  failedCount: number;
}

export const api = {
  async getStockDeck(profile: GetStockDeckRequest): Promise<StockCard[]> {
    const response = await apiRequest("POST", "/api/get-stock-deck", profile);
    return response.json();
  },

  async saveUserProfile(profile: InsertUserProfile) {
    const response = await apiRequest("POST", "/api/user-profile", profile);
    return response.json();
  },

  async getUserProfile(sessionId: string) {
    const response = await apiRequest("GET", `/api/user-profile/${sessionId}`, undefined);
    return response.json();
  },

  async savePortfolio(portfolio: InsertPortfolio): Promise<PortfolioResponse> {
    const response = await apiRequest("POST", "/api/portfolio", portfolio);
    return response.json();
  },

  async getPortfolio(sessionId: string): Promise<PortfolioResponse> {
    const response = await apiRequest("GET", `/api/portfolio/${sessionId}`, undefined);
    return response.json();
  },

  async getSentimentAnalysis(tickers: string[]): Promise<SentimentAnalysisResponse> {
    const response = await apiRequest("POST", "/api/sentiment-analysis", { tickers });
    return response.json();
  }
};
