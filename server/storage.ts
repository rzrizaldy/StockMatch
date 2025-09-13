import { type User, type InsertUser, type UserProfile, type InsertUserProfile, type StockCard, type InsertStockCard, type Portfolio, type InsertPortfolio, users, userProfiles, stockCards, portfolios } from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, inArray } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  getUserProfile(sessionId: string): Promise<UserProfile | undefined>;
  
  getStockCards(): Promise<StockCard[]>;
  createStockCard(card: InsertStockCard): Promise<StockCard>;
  getStockCardsByTickers(tickers: string[]): Promise<StockCard[]>;
  
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  getPortfolio(sessionId: string): Promise<Portfolio | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private userProfiles: Map<string, UserProfile>;
  private stockCards: Map<string, StockCard>;
  private portfolios: Map<string, Portfolio>;

  constructor() {
    this.users = new Map();
    this.userProfiles = new Map();
    this.stockCards = new Map();
    this.portfolios = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createUserProfile(insertProfile: InsertUserProfile): Promise<UserProfile> {
    const id = randomUUID();
    const profile: UserProfile = { 
      ...insertProfile, 
      id,
      industries: insertProfile.industries || [],
      esg: insertProfile.esg || false,
      investmentAmount: insertProfile.investmentAmount || "10000"
    };
    this.userProfiles.set(insertProfile.sessionId, profile);
    return profile;
  }

  async getUserProfile(sessionId: string): Promise<UserProfile | undefined> {
    return this.userProfiles.get(sessionId);
  }

  async getStockCards(): Promise<StockCard[]> {
    return Array.from(this.stockCards.values());
  }

  async createStockCard(insertCard: InsertStockCard): Promise<StockCard> {
    const id = randomUUID();
    const card: StockCard = { 
      ...insertCard, 
      id,
      logoUrl: insertCard.logoUrl || null,
      marketCap: insertCard.marketCap || null,
      beta: insertCard.beta || null,
      esgScore: insertCard.esgScore || null,
      chartData: insertCard.chartData || [],
      listingExchange: insertCard.listingExchange || null,
      marketCategory: insertCard.marketCategory || null,
      roundLotSize: insertCard.roundLotSize || null,
      financialStatus: insertCard.financialStatus || null,
      sentimentScore: insertCard.sentimentScore || null,
      volatility: insertCard.volatility || null,
      averageVolume: insertCard.averageVolume || null,
      fiftyTwoWeekHigh: insertCard.fiftyTwoWeekHigh || null,
      fiftyTwoWeekLow: insertCard.fiftyTwoWeekLow || null,
      etf: insertCard.etf || false,
      nasdaqTraded: insertCard.nasdaqTraded || false
    };
    this.stockCards.set(insertCard.ticker, card);
    return card;
  }

  async getStockCardsByTickers(tickers: string[]): Promise<StockCard[]> {
    return tickers.map(ticker => this.stockCards.get(ticker)).filter(Boolean) as StockCard[];
  }

  async createPortfolio(insertPortfolio: InsertPortfolio): Promise<Portfolio> {
    const id = randomUUID();
    // Get user profile to use their investment amount
    const userProfile = await this.getUserProfile(insertPortfolio.sessionId);
    const investmentAmount = userProfile?.investmentAmount || "10000";
    
    const portfolio: Portfolio = { 
      ...insertPortfolio, 
      id,
      likedStocks: insertPortfolio.likedStocks || [],
      totalValue: insertPortfolio.totalValue || investmentAmount
    };
    this.portfolios.set(insertPortfolio.sessionId, portfolio);
    return portfolio;
  }

  async getPortfolio(sessionId: string): Promise<Portfolio | undefined> {
    return this.portfolios.get(sessionId);
  }
}

export class PostgresStorage implements IStorage {
  private db;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql);
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async createUserProfile(insertProfile: InsertUserProfile): Promise<UserProfile> {
    const result = await this.db.insert(userProfiles).values(insertProfile).returning();
    return result[0];
  }

  async getUserProfile(sessionId: string): Promise<UserProfile | undefined> {
    const result = await this.db.select().from(userProfiles).where(eq(userProfiles.sessionId, sessionId)).limit(1);
    return result[0];
  }

  async getStockCards(): Promise<StockCard[]> {
    return await this.db.select().from(stockCards);
  }

  async createStockCard(insertCard: InsertStockCard): Promise<StockCard> {
    const result = await this.db.insert(stockCards).values(insertCard).returning();
    return result[0];
  }

  async getStockCardsByTickers(tickers: string[]): Promise<StockCard[]> {
    if (tickers.length === 0) return [];
    return await this.db.select().from(stockCards).where(inArray(stockCards.ticker, tickers));
  }

  async createPortfolio(insertPortfolio: InsertPortfolio): Promise<Portfolio> {
    const result = await this.db.insert(portfolios).values(insertPortfolio).returning();
    return result[0];
  }

  async getPortfolio(sessionId: string): Promise<Portfolio | undefined> {
    const result = await this.db.select().from(portfolios).where(eq(portfolios.sessionId, sessionId)).limit(1);
    return result[0];
  }
}

// Switch to PostgresStorage now that data is loaded
// export const storage = new MemStorage();
export const storage = new PostgresStorage();
