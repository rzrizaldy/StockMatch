import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  risk: text("risk").notNull(), // 'conservative', 'balanced', 'aggressive'
  industries: text("industries").array().notNull().default(sql`ARRAY[]::text[]`),
  esg: boolean("esg").notNull().default(false),
});

export const stockCards = pgTable("stock_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticker: text("ticker").notNull().unique(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  hook: text("hook").notNull(),
  metric: text("metric").notNull(),
  industry: text("industry").notNull(),
  marketCap: text("market_cap"),
  beta: text("beta"),
  esgScore: text("esg_score"),
  price: text("price").notNull(), // Current stock price (e.g., "$150.25")
  priceChange: text("price_change").notNull(), // Percentage change (e.g., "+2.5%")
  sentimentSummary: text("sentiment_summary").notNull(), // AI-generated beginner-friendly description
  chartData: text("chart_data").array().notNull().default(sql`ARRAY[]::text[]`), // 30-day price history for sparkline
});

export const portfolios = pgTable("portfolios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  likedStocks: text("liked_stocks").array().notNull().default(sql`ARRAY[]::text[]`),
  totalValue: text("total_value").default("10000"),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
});

export const insertStockCardSchema = createInsertSchema(stockCards).omit({
  id: true,
});

export const insertPortfolioSchema = createInsertSchema(portfolios).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type StockCard = typeof stockCards.$inferSelect;
export type InsertStockCard = z.infer<typeof insertStockCardSchema>;
export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
