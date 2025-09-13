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
  }
};
