import { TrendingUp, TrendingDown, Shield, Target, Clock, Lightbulb, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { SentimentAnalysisData } from "@/lib/api";

interface AISentimentAnalysisProps {
  analysis: SentimentAnalysisData;
  className?: string;
}

export default function AISentimentAnalysis({ analysis, className = "" }: AISentimentAnalysisProps) {
  const getSentimentColor = (score: number) => {
    if (score > 0.3) return "text-green-600 dark:text-green-400";
    if (score > 0.1) return "text-green-500 dark:text-green-300";
    if (score > -0.1) return "text-gray-600 dark:text-gray-400";
    if (score > -0.3) return "text-red-500 dark:text-red-400";
    return "text-red-600 dark:text-red-500";
  };

  const getSentimentBg = (score: number) => {
    if (score > 0.3) return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800";
    if (score > 0.1) return "bg-green-50 dark:bg-green-950 border-green-100 dark:border-green-900";
    if (score > -0.1) return "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800";
    if (score > -0.3) return "bg-red-50 dark:bg-red-950 border-red-100 dark:border-red-900";
    return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800";
  };

  const getSentimentIcon = (trend: string) => {
    switch (trend) {
      case 'bullish':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'bearish':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <TrendingUp className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendBadgeVariant = (trend: string) => {
    switch (trend) {
      case 'bullish':
        return 'default';
      case 'bearish':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getTimeHorizonIcon = (timeHorizon: string) => {
    return <Clock className="w-4 h-4" />;
  };

  // Convert score from -1 to 1 range to 0 to 100 for progress bar
  const progressValue = ((analysis.overallScore + 1) / 2) * 100;
  const confidencePercent = analysis.confidenceLevel * 100;

  return (
    <div className={`space-y-4 ${className}`} data-testid={`ai-sentiment-analysis-${analysis.ticker}`}>
      {/* Overall Score Card */}
      <Card className={`${getSentimentBg(analysis.overallScore)}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span>AI Sentiment Analysis</span>
            <Badge variant={getTrendBadgeVariant(analysis.marketTrend)} className="flex items-center gap-1">
              {getSentimentIcon(analysis.marketTrend)}
              {analysis.marketTrend}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sentiment Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Overall Sentiment</span>
              <span className={`font-semibold ${getSentimentColor(analysis.overallScore)}`}>
                {analysis.overallScore > 0 ? '+' : ''}{(analysis.overallScore * 100).toFixed(0)}%
              </span>
            </div>
            <Progress 
              value={progressValue} 
              className="h-2"
              data-testid={`sentiment-progress-${analysis.ticker}`}
            />
          </div>

          {/* Confidence Level */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">AI Confidence</span>
            <span className="font-medium">
              {confidencePercent.toFixed(0)}%
            </span>
          </div>

          {/* Time Horizon */}
          <div className="flex items-center gap-2 text-sm">
            {getTimeHorizonIcon(analysis.timeHorizon)}
            <span className="text-muted-foreground">Recommended timeframe:</span>
            <span className="font-medium capitalize">{analysis.timeHorizon.replace('-', ' ')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      {analysis.keyInsights.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="w-4 h-4" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.keyInsights.map((insight, index) => (
                <li 
                  key={index} 
                  className="flex items-start gap-2 text-sm"
                  data-testid={`insight-${analysis.ticker}-${index}`}
                >
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Opportunities and Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Opportunities */}
        {analysis.opportunities.length > 0 && (
          <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-green-700 dark:text-green-300">
                <Target className="w-4 h-4" />
                Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.opportunities.map((opportunity, index) => (
                  <li 
                    key={index} 
                    className="flex items-start gap-2 text-sm"
                    data-testid={`opportunity-${analysis.ticker}-${index}`}
                  >
                    <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-green-700 dark:text-green-300">{opportunity}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Risk Factors */}
        {analysis.riskFactors.length > 0 && (
          <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-red-700 dark:text-red-300">
                <Shield className="w-4 h-4" />
                Risk Factors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.riskFactors.map((risk, index) => (
                  <li 
                    key={index} 
                    className="flex items-start gap-2 text-sm"
                    data-testid={`risk-${analysis.ticker}-${index}`}
                  >
                    <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-red-700 dark:text-red-300">{risk}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* AI Recommendation */}
      {analysis.recommendation && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="w-4 h-4" />
              AI Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed" data-testid={`recommendation-${analysis.ticker}`}>
              {analysis.recommendation}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}