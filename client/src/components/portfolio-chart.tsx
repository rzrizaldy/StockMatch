import { useState } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

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

// Custom treemap cell component for better control
const CustomTreemapCell = (props: any) => {
  const { payload, x, y, width, height, fill } = props;
  const [isHovered, setIsHovered] = useState(false);
  
  if (!payload || width < 10 || height < 10) return null;

  const showText = width > 60 && height > 40;
  const showPercentage = width > 40 && height > 25;
  
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        stroke="white"
        strokeWidth={2}
        opacity={isHovered ? 0.8 : 1}
        style={{ cursor: 'pointer', transition: 'opacity 0.2s ease' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-testid={`treemap-cell-${payload.ticker}`}
      />
      {showText && (
        <text
          x={x + width / 2}
          y={y + height / 2 - (showPercentage ? 8 : 0)}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={Math.min(width / 6, height / 4, 14)}
          fontWeight="600"
          style={{ pointerEvents: 'none' }}
          data-testid={`treemap-text-${payload.ticker}`}
        >
          {payload.ticker}
        </text>
      )}
      {showPercentage && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 12}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={Math.min(width / 8, height / 6, 12)}
          fontWeight="500"
          style={{ pointerEvents: 'none' }}
          data-testid={`treemap-percentage-${payload.ticker}`}
        >
          {payload.value}%
        </text>
      )}
    </g>
  );
};

// Industry Legend Component
const IndustryLegend = ({ data }: { data: ChartData[] }) => {
  const industries = Array.from(new Set(data.map(item => item.industry).filter(Boolean)));
  
  if (industries.length === 0) return null;

  return (
    <div className="mt-4" data-testid="industry-legend">
      <h4 className="text-sm font-medium mb-2">Industry Sectors</h4>
      <div className="flex flex-wrap gap-3">
        {industries.map((industry) => (
          <div key={industry} className="flex items-center text-xs" data-testid={`legend-${industry}`}>
            <div
              className="w-3 h-3 rounded mr-2"
              style={{ backgroundColor: getIndustryColor(industry) }}
            />
            <span className="text-muted-foreground">{industry}</span>
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

  // Prepare treemap data with industry colors
  const treemapData = data.map((item) => ({
    ...item,
    fill: getIndustryColor(item.industry)
  }));

  return (
    <div className="w-full" data-testid="portfolio-treemap">
      {/* Treemap Container */}
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={treemapData}
            dataKey="value"
            aspectRatio={16 / 9}
            stroke="white"
            content={<CustomTreemapCell />}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </div>
      
      {/* Industry Legend */}
      <IndustryLegend data={data} />
    </div>
  );
}