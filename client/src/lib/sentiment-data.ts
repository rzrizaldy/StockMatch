import sentimentCsvData from '@assets/A_1757786932651.csv?raw';

export interface SentimentRecord {
  title: string;
  date: Date;
  stock: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface SentimentMetrics {
  positive: number;
  negative: number;
  neutral: number;
  totalCount: number;
  positiveRatio: number;
  negativeRatio: number;
  neutralRatio: number;
  sentimentScore: number; // -1 to 1, where -1 is most negative, 1 is most positive
}

export interface SentimentTrend {
  date: string;
  metrics: SentimentMetrics;
  count: number;
}

export interface TimePeriodMetrics {
  daily: SentimentTrend[];
  weekly: SentimentTrend[];
  monthly: SentimentTrend[];
}

/**
 * Simple CSV parser for browser environment
 */
function parseCSV(csvText: string): any[] {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const records: any[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Handle CSV with quoted fields
    const values: string[] = [];
    let currentValue = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim()); // Add the last value
    
    const record: any = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    records.push(record);
  }
  
  return records;
}

/**
 * Parse the CSV data and return structured sentiment data
 */
export function parseSentimentData(): SentimentRecord[] {
  try {
    const records = parseCSV(sentimentCsvData);

    return records.map((record: any) => ({
      title: (record.title || '').replace(/"/g, ''), // Remove quotes
      date: new Date(record.date),
      stock: record.stock || '',
      sentiment: record.sentiment as 'positive' | 'negative' | 'neutral',
    })).filter((record: SentimentRecord) => 
      record.sentiment && ['positive', 'negative', 'neutral'].includes(record.sentiment)
    );
  } catch (error) {
    console.error('Error parsing sentiment CSV data:', error);
    return [];
  }
}

/**
 * Calculate sentiment metrics for a given array of sentiment records
 */
export function calculateSentimentMetrics(records: SentimentRecord[]): SentimentMetrics {
  if (records.length === 0) {
    return {
      positive: 0,
      negative: 0,
      neutral: 0,
      totalCount: 0,
      positiveRatio: 0,
      negativeRatio: 0,
      neutralRatio: 0,
      sentimentScore: 0,
    };
  }

  const counts = records.reduce((acc, record) => {
    acc[record.sentiment]++;
    return acc;
  }, { positive: 0, negative: 0, neutral: 0 });

  const totalCount = records.length;
  const positiveRatio = counts.positive / totalCount;
  const negativeRatio = counts.negative / totalCount;
  const neutralRatio = counts.neutral / totalCount;

  // Calculate sentiment score: (positive - negative) / total, ranging from -1 to 1
  const sentimentScore = (counts.positive - counts.negative) / totalCount;

  return {
    positive: counts.positive,
    negative: counts.negative,
    neutral: counts.neutral,
    totalCount,
    positiveRatio,
    negativeRatio,
    neutralRatio,
    sentimentScore,
  };
}

/**
 * Group sentiment data by time periods and calculate metrics
 */
export function groupSentimentByTimePeriods(records: SentimentRecord[]): TimePeriodMetrics {
  // Sort records by date
  const sortedRecords = [...records].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Group by day
  const dailyGroups = new Map<string, SentimentRecord[]>();
  const weeklyGroups = new Map<string, SentimentRecord[]>();
  const monthlyGroups = new Map<string, SentimentRecord[]>();

  sortedRecords.forEach(record => {
    const date = record.date;
    
    // Daily grouping (YYYY-MM-DD)
    const dayKey = date.toISOString().split('T')[0];
    if (!dailyGroups.has(dayKey)) {
      dailyGroups.set(dayKey, []);
    }
    dailyGroups.get(dayKey)!.push(record);

    // Weekly grouping (year-week)
    const year = date.getFullYear();
    const week = getWeekNumber(date);
    const weekKey = `${year}-W${week.toString().padStart(2, '0')}`;
    if (!weeklyGroups.has(weekKey)) {
      weeklyGroups.set(weekKey, []);
    }
    weeklyGroups.get(weekKey)!.push(record);

    // Monthly grouping (YYYY-MM)
    const monthKey = `${year}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    if (!monthlyGroups.has(monthKey)) {
      monthlyGroups.set(monthKey, []);
    }
    monthlyGroups.get(monthKey)!.push(record);
  });

  return {
    daily: Array.from(dailyGroups.entries()).map(([date, records]) => ({
      date,
      metrics: calculateSentimentMetrics(records),
      count: records.length,
    })),
    weekly: Array.from(weeklyGroups.entries()).map(([date, records]) => ({
      date,
      metrics: calculateSentimentMetrics(records),
      count: records.length,
    })),
    monthly: Array.from(monthlyGroups.entries()).map(([date, records]) => ({
      date,
      metrics: calculateSentimentMetrics(records),
      count: records.length,
    })),
  };
}

/**
 * Get sentiment trends over time with moving averages
 */
export function getSentimentTrends(
  records: SentimentRecord[],
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  movingAverageDays = 7
): SentimentTrend[] {
  const timePeriods = groupSentimentByTimePeriods(records);
  const trends = timePeriods[period];

  // Calculate moving averages for sentiment scores
  return trends.map((trend, index) => {
    const startIndex = Math.max(0, index - movingAverageDays + 1);
    const window = trends.slice(startIndex, index + 1);
    
    const avgSentimentScore = window.reduce((sum, t) => sum + t.metrics.sentimentScore, 0) / window.length;
    const avgPositiveRatio = window.reduce((sum, t) => sum + t.metrics.positiveRatio, 0) / window.length;
    const avgNegativeRatio = window.reduce((sum, t) => sum + t.metrics.negativeRatio, 0) / window.length;

    return {
      ...trend,
      metrics: {
        ...trend.metrics,
        sentimentScore: avgSentimentScore,
        positiveRatio: avgPositiveRatio,
        negativeRatio: avgNegativeRatio,
      },
    };
  });
}

/**
 * Calculate sentiment statistics for a stock
 */
export function getStockSentimentStats(stock: string): {
  overall: SentimentMetrics;
  timePeriods: TimePeriodMetrics;
  trends: {
    daily: SentimentTrend[];
    weekly: SentimentTrend[];
    monthly: SentimentTrend[];
  };
  recentTrend: 'improving' | 'declining' | 'stable';
} {
  const allRecords = parseSentimentData();
  const stockRecords = allRecords.filter(record => record.stock === stock);

  const overall = calculateSentimentMetrics(stockRecords);
  const timePeriods = groupSentimentByTimePeriods(stockRecords);

  const trends = {
    daily: getSentimentTrends(stockRecords, 'daily', 7),
    weekly: getSentimentTrends(stockRecords, 'weekly', 4),
    monthly: getSentimentTrends(stockRecords, 'monthly', 3),
  };

  // Determine recent trend by comparing last 30 days vs previous 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const recentRecords = stockRecords.filter(record => record.date >= thirtyDaysAgo);
  const previousRecords = stockRecords.filter(record => 
    record.date >= sixtyDaysAgo && record.date < thirtyDaysAgo
  );

  const recentScore = calculateSentimentMetrics(recentRecords).sentimentScore;
  const previousScore = calculateSentimentMetrics(previousRecords).sentimentScore;

  let recentTrend: 'improving' | 'declining' | 'stable' = 'stable';
  const scoreDiff = recentScore - previousScore;
  
  if (scoreDiff > 0.1) {
    recentTrend = 'improving';
  } else if (scoreDiff < -0.1) {
    recentTrend = 'declining';
  }

  return {
    overall,
    timePeriods,
    trends,
    recentTrend,
  };
}

/**
 * Get top positive and negative sentiment articles
 */
export function getTopSentimentArticles(
  stock: string,
  sentiment: 'positive' | 'negative',
  limit = 10
): SentimentRecord[] {
  const allRecords = parseSentimentData();
  const stockRecords = allRecords.filter(record => 
    record.stock === stock && record.sentiment === sentiment
  );

  // Sort by date (most recent first)
  return stockRecords
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);
}

/**
 * Helper function to get week number
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Get sentiment data for charting
 */
export function getSentimentChartData(
  stock: string,
  period: 'daily' | 'weekly' | 'monthly' = 'daily'
): Array<{
  date: string;
  positive: number;
  negative: number;
  neutral: number;
  sentimentScore: number;
  count: number;
}> {
  const allRecords = parseSentimentData();
  const stockRecords = allRecords.filter(record => record.stock === stock);
  const timePeriods = groupSentimentByTimePeriods(stockRecords);

  return timePeriods[period].map(trend => ({
    date: trend.date,
    positive: trend.metrics.positive,
    negative: trend.metrics.negative,
    neutral: trend.metrics.neutral,
    sentimentScore: trend.metrics.sentimentScore,
    count: trend.count,
  }));
}