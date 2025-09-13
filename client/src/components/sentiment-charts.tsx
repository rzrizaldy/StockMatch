import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  parseSentimentData,
  calculateSentimentMetrics,
  getSentimentChartData,
  getStockSentimentStats,
  getTopSentimentArticles,
  SentimentRecord,
  SentimentMetrics,
} from '@/lib/sentiment-data';
import { TrendingUp, TrendingDown, Minus, Activity, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';

interface SentimentChartsProps {
  stock: string;
  className?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

// Custom tooltip for time series charts
const TimeSeriesTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-sm mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: entry.color }}
            />
            <span className="capitalize">{entry.dataKey}:</span>
            <span className="font-semibold">{entry.value}</span>
            {entry.dataKey === 'sentimentScore' && (
              <span className="text-muted-foreground">
                ({(entry.value * 100).toFixed(1)}%)
              </span>
            )}
          </div>
        ))}
        {data.count && (
          <p className="text-xs text-muted-foreground mt-1">
            {data.count} articles
          </p>
        )}
      </div>
    );
  }
  return null;
};

// Custom tooltip for pie chart
const PieTooltip = ({ active, payload }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-sm capitalize">{data.name}</p>
        <p className="text-xs">
          <span className="font-semibold">{data.value}</span> articles
        </p>
        <p className="text-xs text-muted-foreground">
          {data.payload.percentage}%
        </p>
      </div>
    );
  }
  return null;
};

// Sentiment colors
const SENTIMENT_COLORS = {
  positive: '#22c55e',
  negative: '#ef4444',
  neutral: '#6b7280',
};

// Gauge component for sentiment score
const SentimentGauge = ({ score, className }: { score: number; className?: string }) => {
  // Convert score from -1 to 1 range to 0 to 100 for display
  const normalizedScore = ((score + 1) / 2) * 100;
  
  const data = [{
    name: 'Sentiment Score',
    value: normalizedScore,
    fill: score > 0.2 ? SENTIMENT_COLORS.positive : score < -0.2 ? SENTIMENT_COLORS.negative : SENTIMENT_COLORS.neutral,
  }];

  const getScoreLabel = (score: number) => {
    if (score > 0.3) return 'Very Positive';
    if (score > 0.1) return 'Positive';
    if (score > -0.1) return 'Neutral';
    if (score > -0.3) return 'Negative';
    return 'Very Negative';
  };

  const getScoreIcon = (score: number) => {
    if (score > 0.1) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (score < -0.1) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className={`text-center ${className}`} data-testid="sentiment-gauge">
      <div className="h-32 mb-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="90%"
            startAngle={180}
            endAngle={0}
            data={data}
          >
            <RadialBar dataKey="value" cornerRadius={10} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-2">
        {getScoreIcon(score)}
        <span className="font-medium" data-testid="sentiment-score-label">
          {getScoreLabel(score)}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mt-1" data-testid="sentiment-score-value">
        Score: {score.toFixed(3)}
      </p>
    </div>
  );
};

// Article list component
const TopArticles = ({ 
  articles, 
  sentiment, 
  className 
}: { 
  articles: SentimentRecord[]; 
  sentiment: 'positive' | 'negative';
  className?: string;
}) => {
  if (articles.length === 0) {
    return (
      <div className={`text-center text-muted-foreground py-8 ${className}`}>
        No {sentiment} articles found
      </div>
    );
  }

  return (
    <div className={className} data-testid={`top-${sentiment}-articles`}>
      <div className="space-y-3">
        {articles.slice(0, 5).map((article, index) => (
          <div
            key={index}
            className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            data-testid={`article-${index}`}
          >
            <h4 className="text-sm font-medium line-clamp-2 mb-1">
              {article.title}
            </h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span data-testid={`article-date-${index}`}>
                {article.date.toLocaleDateString()}
              </span>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  sentiment === 'positive' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}
                data-testid={`article-sentiment-${index}`}
              >
                {sentiment}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function SentimentCharts({ stock, className }: SentimentChartsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Pure memoized sentiment data calculations - no side effects
  const sentimentDataResult = useMemo(() => {
    try {
      const stats = getStockSentimentStats(stock);
      const chartData = getSentimentChartData(stock, selectedPeriod);
      const positiveArticles = getTopSentimentArticles(stock, 'positive', 5);
      const negativeArticles = getTopSentimentArticles(stock, 'negative', 5);
      
      // Check if we have empty datasets and provide meaningful feedback
      const hasData = stats.overall.totalCount > 0;
      const hasChartData = chartData.length > 0;
      
      return {
        success: true,
        data: {
          stats,
          chartData,
          positiveArticles,
          negativeArticles,
        },
        hasData,
        hasChartData,
        error: null,
      };
    } catch (err) {
      console.error('Error processing sentiment data:', err);
      return {
        success: false,
        data: null,
        hasData: false,
        hasChartData: false,
        error: 'Failed to load sentiment data. Please check that the data file is properly formatted.',
      };
    }
  }, [stock, selectedPeriod]);

  // Error state
  if (!sentimentDataResult.success || sentimentDataResult.error) {
    return (
      <div className={`text-center py-8 ${className}`} data-testid="sentiment-charts-error">
        <p className="text-red-500 mb-4">{sentimentDataResult.error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
          data-testid="retry-button"
        >
          Retry
        </Button>
      </div>
    );
  }

  // Empty data state
  if (!sentimentDataResult.hasData) {
    return (
      <div className={`text-center py-8 ${className}`} data-testid="sentiment-charts-empty">
        <h3 className="text-lg font-medium mb-2">No Data Available</h3>
        <p className="text-muted-foreground mb-4">
          No sentiment data found for stock symbol "{stock}".
        </p>
        <p className="text-sm text-muted-foreground">
          Please verify the stock symbol or check that sentiment data is available.
        </p>
      </div>
    );
  }

  const { stats, chartData, positiveArticles, negativeArticles } = sentimentDataResult.data!;

  // Prepare pie chart data
  const pieData = [
    {
      name: 'positive',
      value: stats.overall.positive,
      percentage: (stats.overall.positiveRatio * 100).toFixed(1),
    },
    {
      name: 'negative',
      value: stats.overall.negative,
      percentage: (stats.overall.negativeRatio * 100).toFixed(1),
    },
    {
      name: 'neutral',
      value: stats.overall.neutral,
      percentage: (stats.overall.neutralRatio * 100).toFixed(1),
    },
  ].filter(item => item.value > 0);

  // Prepare bar chart data for sentiment counts over time
  const barData = chartData.slice(-10).map(item => ({
    date: item.date,
    positive: item.positive,
    negative: item.negative,
    neutral: item.neutral,
  }));

  return (
    <div className={`space-y-6 ${className}`} data-testid="sentiment-charts">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" data-testid="sentiment-charts-title">
            Sentiment Analysis for {stock}
          </h2>
          <p className="text-muted-foreground" data-testid="sentiment-charts-subtitle">
            {stats.overall.totalCount} articles analyzed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-muted-foreground" />
          <span 
            className={`font-medium ${
              stats.recentTrend === 'improving' ? 'text-green-600' :
              stats.recentTrend === 'declining' ? 'text-red-600' : 
              'text-gray-600'
            }`}
            data-testid="recent-trend"
          >
            {stats.recentTrend}
          </span>
        </div>
      </div>

      {/* Time Period Selector */}
      <Tabs 
        value={selectedPeriod} 
        onValueChange={(value) => setSelectedPeriod(value as 'daily' | 'weekly' | 'monthly')}
        className="w-full"
        data-testid="time-period-tabs"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily" data-testid="daily-tab">Daily</TabsTrigger>
          <TabsTrigger value="weekly" data-testid="weekly-tab">Weekly</TabsTrigger>
          <TabsTrigger value="monthly" data-testid="monthly-tab">Monthly</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedPeriod} className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Overall Score</p>
                  <p className="text-2xl font-bold" data-testid="overall-score">
                    {stats.overall.sentimentScore.toFixed(3)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Positive</p>
                  <p className="text-2xl font-bold text-green-600" data-testid="positive-count">
                    {stats.overall.positive}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(stats.overall.positiveRatio * 100).toFixed(1)}%
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Negative</p>
                  <p className="text-2xl font-bold text-red-600" data-testid="negative-count">
                    {stats.overall.negative}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(stats.overall.negativeRatio * 100).toFixed(1)}%
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Neutral</p>
                  <p className="text-2xl font-bold text-gray-600" data-testid="neutral-count">
                    {stats.overall.neutral}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(stats.overall.neutralRatio * 100).toFixed(1)}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Time Series Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Sentiment Trends Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64" data-testid="sentiment-time-series">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[-1, 1]} />
                      <Tooltip content={<TimeSeriesTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="sentimentScore"
                        stroke={SENTIMENT_COLORS.positive}
                        fill={`${SENTIMENT_COLORS.positive}20`}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Sentiment Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64" data-testid="sentiment-pie-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {pieData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={SENTIMENT_COLORS[entry.name as keyof typeof SENTIMENT_COLORS]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Pie Chart Legend */}
                <div className="flex justify-center gap-4 mt-4">
                  {pieData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2 text-xs">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ 
                          backgroundColor: SENTIMENT_COLORS[entry.name as keyof typeof SENTIMENT_COLORS] 
                        }}
                      />
                      <span className="capitalize">{entry.name}</span>
                      <span className="font-semibold">({entry.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Article Volume Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64" data-testid="sentiment-bar-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="positive" stackId="a" fill={SENTIMENT_COLORS.positive} />
                      <Bar dataKey="negative" stackId="a" fill={SENTIMENT_COLORS.negative} />
                      <Bar dataKey="neutral" stackId="a" fill={SENTIMENT_COLORS.neutral} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Sentiment Gauge */}
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Score Gauge</CardTitle>
              </CardHeader>
              <CardContent>
                <SentimentGauge score={stats.overall.sentimentScore} />
              </CardContent>
            </Card>
          </div>

          {/* Top Articles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Top Positive Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <TopArticles 
                  articles={positiveArticles} 
                  sentiment="positive"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Top Negative Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <TopArticles 
                  articles={negativeArticles} 
                  sentiment="negative"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}