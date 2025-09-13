import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ChartData {
  name: string;
  ticker: string;
  value: number;
  color?: string;
  industry?: string;
}

interface PortfolioChartProps {
  data: ChartData[];
}

// Industry-based color mapping per requirements
const INDUSTRY_COLORS = {
  'Technology': 'hsl(210, 100%, 50%)',     // Blue
  'Healthcare': 'hsl(0, 100%, 50%)',       // Red  
  'Finance': 'hsl(262, 83%, 58%)',         // Purple
  'Consumer': 'hsl(43, 96%, 56%)',         // Yellow
  'Energy': 'hsl(27, 87%, 67%)',           // Orange
  'Entertainment': 'hsl(142, 76%, 36%)',   // Green
  'Automotive': 'hsl(180, 100%, 50%)',     // Cyan
  'default': 'hsl(220, 13%, 69%)'          // Neutral gray
};

const getIndustryColor = (industry: string | undefined) => {
  if (!industry) return INDUSTRY_COLORS.default;
  return INDUSTRY_COLORS[industry as keyof typeof INDUSTRY_COLORS] || INDUSTRY_COLORS.default;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg max-w-xs">
        <p className="font-semibold text-sm">{data.name}</p>
        <p className="text-xs text-muted-foreground mb-2">{data.ticker}</p>
        <p className="text-sm">
          <span className="font-semibold">{data.value}%</span> of portfolio
        </p>
        {data.industry && (
          <p className="text-xs text-muted-foreground mt-1">
            {data.industry} Sector
          </p>
        )}
      </div>
    );
  }
  return null;
};


// Industry Legend Component
const IndustryLegend = ({ data }: { data: ChartData[] }) => {
  const industries = Array.from(new Set(data.map(item => item.industry).filter(Boolean)));
  
  if (industries.length === 0) return null;

  return (
    <div className="mt-4" data-testid="industry-legend">
      <h4 className="text-sm font-medium mb-3 text-center">Industry Sectors</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2 max-w-2xl mx-auto">
        {industries.map((industry) => (
          <div key={industry} className="flex items-center text-xs whitespace-nowrap" data-testid={`legend-${industry}`}>
            <div
              className="w-3 h-3 rounded mr-2 flex-shrink-0"
              style={{ backgroundColor: getIndustryColor(industry) }}
            />
            <span className="text-muted-foreground truncate">{industry}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function PortfolioChart({ data }: PortfolioChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No portfolio data available
      </div>
    );
  }

  // Prepare chart data with industry colors
  const chartData = data.map((item) => ({
    ...item,
    fill: getIndustryColor(item.industry)
  }));

  return (
    <div className="w-full" data-testid="portfolio-donut-chart">
      {/* Industry Legend */}
      <IndustryLegend data={data} />
      
      {/* Donut Chart Container */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              data-testid="portfolio-pie"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill}
                  data-testid={`pie-cell-${entry.ticker}`}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}