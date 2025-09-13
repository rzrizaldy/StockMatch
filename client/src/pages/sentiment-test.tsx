import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SentimentCharts from '@/components/sentiment-charts';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';

export default function SentimentTest() {
  const [selectedStock, setSelectedStock] = useState<string>('A');
  const [customStock, setCustomStock] = useState<string>('');

  const handleCustomStockSubmit = () => {
    if (customStock.trim()) {
      setSelectedStock(customStock.trim().toUpperCase());
      setCustomStock('');
    }
  };

  const testStocks = ['A', 'AAPL', 'GOOGL', 'MSFT', 'TSLA'];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="outline" size="sm" data-testid="back-button">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold" data-testid="page-title">
            Sentiment Analysis Test
          </h1>
        </div>

        {/* Stock Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Stock for Sentiment Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="stock-input">Stock Symbol</Label>
                <Input
                  id="stock-input"
                  value={customStock}
                  onChange={(e) => setCustomStock(e.target.value)}
                  placeholder="Enter stock symbol (e.g., AAPL)"
                  className="uppercase"
                  data-testid="stock-input"
                />
              </div>
              <Button 
                onClick={handleCustomStockSubmit}
                data-testid="analyze-button"
              >
                Analyze
              </Button>
            </div>
            
            {/* Quick Select Buttons */}
            <div className="mt-4">
              <Label className="text-sm text-muted-foreground">Or select from common stocks:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {testStocks.map((stock) => (
                  <Button
                    key={stock}
                    variant={selectedStock === stock ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedStock(stock)}
                    data-testid={`stock-button-${stock}`}
                  >
                    {stock}
                  </Button>
                ))}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              Currently analyzing: <strong className="text-foreground" data-testid="current-stock">{selectedStock}</strong>
            </p>
          </CardContent>
        </Card>

        {/* Sentiment Charts Component */}
        <SentimentCharts stock={selectedStock} data-testid="sentiment-charts-container" />

        {/* Test Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Test Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>• This page tests the SentimentCharts component with real sentiment data</p>
              <p>• Data is loaded from the attached CSV file with 1800+ sentiment records</p>
              <p>• Charts should show time series trends, sentiment distribution, article volumes, and sentiment gauge</p>
              <p>• Try different stocks to see how sentiment varies</p>
              <p>• Switch between daily, weekly, and monthly views</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}