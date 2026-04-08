import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

export const cacheTTL = {
  fiveMinutes: 300,
  oneHour: 3600
} as const;

export const cacheKeys = {
  dashboard: (userId: string) => `finance-os:${userId}:dashboard`,
  sparkline: (userId: string) => `finance-os:${userId}:sparkline`,
  monthlyComparison: (userId: string, year: number, month: number) =>
    `finance-os:${userId}:monthly-comparison:${year}-${month}`,
  categoryBreakdown: (userId: string, year: number, month: number) =>
    `finance-os:${userId}:category-breakdown:${year}-${month}`,
  taxSummary: (userId: string, year: number, month: number) =>
    `finance-os:${userId}:tax-summary:${year}-${month}`,
  anomalies: (userId: string, year: number, month: number) =>
    `finance-os:${userId}:anomalies:${year}-${month}`,
  boardAnalytics: (boardId: string) => `finance-os:board:${boardId}:analytics`,
  portfolio: (userId: string) => `finance-os:${userId}:portfolio`,
  netWorthHistory: (userId: string) => `finance-os:${userId}:net-worth-history`,
  aiInsight: (userId: string, year: number, month: number) =>
    `finance-os:${userId}:ai-insight:${year}-${month}`
} as const;

